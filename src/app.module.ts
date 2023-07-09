import { Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { User, UserSchema } from '../models/user.model';
import { Chat, ChatSchema } from '../models/chat.model';
import { Message, MessageSchema } from '../models/message.model';
import { UserService } from './user.service';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { SessionMiddleware } from './session.middleware';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';
import { GroupChat, GroupChatSchema } from '../models/groupchat.model';
import { SocketGateway } from './socket.gateway';
import { GroupChatService } from './groupchat.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.DB_CONNECTION_STRING),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    MongooseModule.forFeature([
      { name: GroupChat.name, schema: GroupChatSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SocketGateway,
    UserService,
    ChatService,
    MessageService,
    GroupChatService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)
      .forRoutes({ path: '/', method: RequestMethod.GET });
  }
}
