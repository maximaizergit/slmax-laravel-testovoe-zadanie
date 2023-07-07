import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Message extends Document {
  @Prop()
  text: string;

  @Prop()
  sender: string;

  @Prop()
  chatId: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
