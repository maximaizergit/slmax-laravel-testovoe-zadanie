import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageService } from './message.service';

import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UserService } from './user.service';
import { GroupChatService } from './groupchat.service';
import * as fs from 'fs';
import * as path from 'path';
import sharp = require('sharp');

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly groupChatService: GroupChatService,
  ) {}
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('getChats')
  async handleGetChats(client: Socket, data: { userId: string }) {
    const userId = data.userId;
    client.data.userId = userId;

    this.userService
      .getUsers()
      .then(async (users) => {
        // Отфильтровать список пользователей, чтобы получить только id и имя
        const filteredUsers = users.map((user) => ({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          online: false, // По умолчанию пользователь считается оффлайн
        }));
        // Получить последние сообщения для каждого чата пользователя
        const chatPromises = filteredUsers.map(async (user) => {
          const chat = await this.chatService.getChat(userId, user.id);
          let lastMessage;
          if (chat) {
            lastMessage = await this.messageService.getLastMessageByChatId(
              chat['_id'],
            );
          }

          const recipientSocket = await this.findSocketByUserId(user.id);
          if (recipientSocket) {
            user.online = true; // Пользователь находится в сети
          }
          return {
            ...user,
            lastMessage: lastMessage,
          };
        });

        const groupChats = await this.groupChatService.getAllGroupChats();

        const groupChatPromises = groupChats.map(async (groupChat) => {
          const lastMessage = await this.messageService.getLastMessageByChatId(
            groupChat['_id'].toString(),
          );

          return {
            id: groupChat['_id'].toString(),
            name: groupChat.name,
            lastMessage: lastMessage,
            isGroup: true,
          };
        });
        const promises = [...chatPromises, ...groupChatPromises];

        Promise.all(promises)
          .then((chatsWithLastMessages) => {
            // Отсортировать чаты по времени последнего сообщения (по убыванию)
            chatsWithLastMessages.sort((a, b) => {
              if (a.lastMessage && b.lastMessage) {
                return (
                  b.lastMessage.createdAt.getTime() -
                  a.lastMessage.createdAt.getTime()
                );
              }
              // Если у одного из чатов нет последнего сообщения, поместить его ниже
              if (!a.lastMessage) return 1;
              if (!b.lastMessage) return -1;
              return 0;
            });

            client.emit('userList', chatsWithLastMessages);
          })
          .catch((error) => {
            console.error('Error retrieving user list:', error);
          });
      })
      .catch((error) => {
        console.error('Error retrieving user list:', error);
      });
  }

  @SubscribeMessage('sendMessage')
  async handleNewMessage(
    client: Socket,
    data: {
      message: any;
      recepientId: any;
      userId: any;
      file: any;
      originalName: string;
    },
  ) {
    if (data.file) {
      // Создаем уникальное имя файла
      const fileName = `${Date.now()}-${data.originalName}`;

      // Определяем путь к папке uploads
      const uploadsFolder = path.join(__dirname, '..', '..', 'uploads');

      // Полный путь к сохраняемому файлу
      const filePath = path.join(uploadsFolder, fileName);

      try {
        // Проверяем формат файла
        if (data.file.mimetype === 'image/jpeg') {
          // Конвертируем изображение в формат png и сохраняем на диск
          await sharp(data.file.buffer)
            .toFormat('png')
            .png({ quality: 80 })
            .toFile(filePath);
        } else {
          // Сохраняем файл на диск без конвертации
          const imageBuffer = Buffer.from(new Uint8Array(data.file.buffer));
          fs.writeFileSync(filePath, imageBuffer);
        }

        // Устанавливаем ссылку на файл в сообщении
        data.message.file = `/uploads/${fileName}`;
      } catch (error) {
        console.error('Error saving file:', error);

        // В случае ошибки, устанавливаем file равным null
        data.message.file = null;
      }
    }

    // Создание сообщения
    await this.messageService.createMessage(
      data.message.text,
      data.message.sender,
      data.message.chatId,
      data.message.file, // Передача ссылки на файл в качестве параметра
    );

    // Отправка сообщения получателям

    client.to(data.message.chatId).emit('messageReceived', data);
    client.emit('messageReceived', data);

    // Уведомление получателя о новом сообщении
    this.findSocketByUserId(data.recepientId)
      .then((recipientSocket) => {
        if (recipientSocket) {
          recipientSocket.emit('newMessageNotification', data, data.userId);
        }
      })
      .catch((error) => {
        console.error('Error finding recipient socket:', error);
      });
  }

  // Вспомогательная функция для поиска сокета по идентификатору пользователя
  async findSocketByUserId(userId: string): Promise<Socket> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [socketId, socket] of this.server.of('/').sockets) {
      if (socket.data.userId === userId) {
        return socket;
      }
    }
    return null;
  }

  @SubscribeMessage('selectChat')
  async handleSelectChat(client: Socket, data: any) {
    // Получить id текущего пользователя
    const currentUserId = data.userId;

    // Получить id выбранного пользователя
    const selectedUserId = data.selectedUserId;

    // Получить или создать chatId для выбранного пользователя
    if (!data.isGroup) {
      const chatData = await this.chatService.getOrCreateChat(
        currentUserId,
        selectedUserId,
      );
      // Получить информацию о другом пользователе
      const otherUser = await this.userService.findUserById(selectedUserId);

      // Присоединить клиента к комнате чата
      client.join(chatData.toString());

      const messages = await this.messageService.getMessagesByChatId(chatData);

      client.emit('chatSelected', {
        chatId: chatData,
        messages: messages,
        otherUser: {
          name: otherUser.name,
          avatar: otherUser.avatar,
        },
        isGroup: false,
      });
    } else {
      //немного измененная логика для групповых чатов
      const chatData = await this.groupChatService.getGroupChatById(
        selectedUserId,
      );
      client.join(selectedUserId.toString());
      const messages = await this.messageService.getMessagesByChatId(
        selectedUserId,
      );
      client.emit('chatSelected', {
        chatId: selectedUserId,
        messages: messages,
        otherUser: {
          name: chatData.name,
          avatar: 'default-avatar',
        },
        isGroup: true,
      });
    }
  }

  @SubscribeMessage('getAllUsersStatus')
  async handleGetAllUsersStatus(client: Socket) {
    const usersStatus = await this.getAllUsersStatus(); // функция для получения статуса всех пользователей

    // Отправляем обновленные статусы пользователей клиенту
    client.emit('allUsersStatusUpdate', usersStatus);
  }
  async getAllUsersStatus() {
    const users = await this.userService.getUsers(); // Получаем список всех пользователей

    const usersStatus = [];

    for (const user of users) {
      const userId = user.id;
      const socket = await this.findSocketByUserId(userId); // Находим сокет пользователя

      // Проверяем, находится ли пользователь в сети
      const status = socket ? true : false;

      usersStatus.push({ userId, status });
    }

    return usersStatus; // Возвращаем массив со статусами пользователей
  }
  @SubscribeMessage('searchMessages')
  async handleSearchMessages(
    client: Socket,
    data: { searchText: string; activeChat: string },
  ) {
    const { searchText, activeChat } = data;

    const foundMessages = await this.messageService.searchMessages(
      searchText,
      activeChat,
    );
    // Отправьте найденные сообщения обратно на клиент
    client.emit('searchMessagesResult', { messages: foundMessages });
  }
}
