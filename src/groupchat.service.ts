import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupChat } from '../models/groupchat.model';

@Injectable()
export class GroupChatService {
  constructor(
    @InjectModel(GroupChat.name) private groupChatModel: Model<GroupChat>,
  ) {}

  async createGroupChat(name: string): Promise<GroupChat> {
    const groupChat = new this.groupChatModel({ name });
    return groupChat.save();
  }

  async getAllGroupChats(): Promise<GroupChat[]> {
    return this.groupChatModel.find().exec();
  }

  async getGroupChatById(id: string): Promise<GroupChat | null> {
    return this.groupChatModel.findById(id).exec();
  }

  async deleteGroupChat(id: string): Promise<void> {
    await this.groupChatModel.findByIdAndDelete(id).exec();
  }
}
