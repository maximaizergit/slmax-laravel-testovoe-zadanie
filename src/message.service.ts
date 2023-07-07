import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../models/message.model';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  async createMessage(
    text: string,
    sender: string,
    chatId: string,
  ): Promise<Message> {
    const message = new this.messageModel({ text, sender, chatId });
    return message.save();
  }

  async getMessagesByChatId(chatId: string): Promise<Message[]> {
    return this.messageModel.find({ chatId }).exec();
  }
}
