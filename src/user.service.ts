import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createUser(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    const user = new this.userModel({ name, email, password });
    return user.save();
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async findUserByName(name: string): Promise<User> {
    return this.userModel.findOne({ name }).exec();
  }

  async findUserById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async findUserByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<User> {
    return this.userModel.findOne({ email, password }).exec();
  }

  async getUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
