import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;
  id: any;

  @Prop({ default: 'default-avatar' })
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
