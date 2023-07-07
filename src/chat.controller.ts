import { Body, Controller, Post, Param, Get } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(): Promise<{ chatId: string }> {
    const chat = await this.chatService.createChat();
    return { chatId: chat._id };
  }

  @Post(':chatId/participant')
  async addParticipant(
    @Param('chatId') chatId: string,
    @Body('userId') userId: string,
  ): Promise<{ chatId: string }> {
    await this.chatService.addParticipant(chatId, userId);
    return { chatId };
  }

  @Get(':chatId')
  async getChatById(@Param('chatId') chatId: string) {
    return this.chatService.getChatById(chatId);
  }
}
