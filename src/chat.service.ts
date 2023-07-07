import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from '../models/chat.model';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
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
}
