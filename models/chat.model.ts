import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Chat extends Document {
  @Prop()
  participants: string[];
  @Prop()
  id: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
