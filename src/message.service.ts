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
    file: string,
  ): Promise<Message> {
    const message = new this.messageModel({ text, sender, chatId, file });
    return message.save();
  }

  async getMessagesByChatId(chatId: string): Promise<Message[]> {
    return this.messageModel.find({ chatId }).exec();
  }

  async markMessageAsRead(messageId: string): Promise<Message> {
    return this.messageModel
      .findByIdAndUpdate(messageId, { read: true }, { new: true })
      .exec();
  }

  async getLastMessageByChatId(chatId: string): Promise<Message> {
    return this.messageModel.findOne({ chatId }).sort({ _id: -1 }).exec();
  }

  async getUnreadMessageCount(chatId: string): Promise<number> {
    return this.messageModel.countDocuments({ chatId, read: false }).exec();
  }
  async searchMessages(searchText: string, chatId: string): Promise<Message[]> {
    const foundMessages = await this.messageModel
      .find({
        chatId: chatId,
        text: searchText,
      })
      .exec();

    return foundMessages;
  }
}
