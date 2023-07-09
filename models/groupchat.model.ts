import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class GroupChat extends Document {
  @Prop()
  id: string;

  @Prop()
  name: string; // Добавляем поле для названия общего чата
}

export const GroupChatSchema = SchemaFactory.createForClass(GroupChat);
