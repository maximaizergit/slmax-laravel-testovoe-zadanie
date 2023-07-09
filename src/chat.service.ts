import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from '../models/chat.model';

import { MessageService } from './message.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
    private readonly messageService: MessageService,
  ) {}

  async createChat(): Promise<Chat> {
    const chat = new this.chatModel();
    chat.participants = [];
    return chat.save();
  }

  async addParticipant(chatId: string, userId: string): Promise<Chat> {
    return this.chatModel
      .findByIdAndUpdate(
        chatId,
        { $push: { participants: userId } },
        { new: true },
      )
      .exec();
  }

  async getChatById(chatId: string): Promise<Chat> {
    return this.chatModel.findById(chatId).exec();
  }

  async getChatsByUserId(userId: string): Promise<Chat[]> {
    return this.chatModel.find({ participants: userId }).exec();
  }

  async getChatByParticipants(participants: string[]): Promise<Chat> {
    return this.chatModel.findOne({ participants }).exec();
  }

  async getOrCreateChat(user1Id: string, user2Id: string): Promise<any> {
    // Поиск чата, в котором присутствуют оба пользователя

    const chat = await this.chatModel
      .findOne({
        participants: {
          $all: [user1Id, user2Id],
        },
      })
      .exec();

    // Если чат найден, возвращаем его id
    if (chat) {
      return chat['_id'];
    }

    // Если чат не найден, создаем новый чат
    const newChat = new this.chatModel();
    newChat.participants = [user1Id, user2Id];

    await newChat.save();

    // Возвращаем id нового чата
    return newChat._id;
  }
  async getChat(user1Id: string, user2Id: string): Promise<any> {
    // Поиск чата, в котором присутствуют оба пользователя

    const chat = await this.chatModel
      .findOne({
        participants: {
          $all: [user1Id, user2Id],
        },
      })
      .exec();

    // Если чат найден, возвращаем его id
    if (chat) {
      return chat['_id'];
    }

    return null;
  }
}
