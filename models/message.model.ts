import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Message extends Document {
  @Prop()
  text: string;
  id: any;

  @Prop()
  sender: string;

  @Prop()
  chatId: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop()
  file: string;
}
export const MessageSchema = SchemaFactory.createForClass(Message).set(
  'timestamps',
  true,
);
