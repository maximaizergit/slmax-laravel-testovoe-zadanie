import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Chat extends Document {
  @Prop()
  id: string;

  @Prop()
  participants: string[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
