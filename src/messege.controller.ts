import { Body, Controller, Post, Get, Param, Res } from '@nestjs/common';
import { Message } from '../models/message.model';
import { MessageService } from './message.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Multer } from 'multer';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { Express } from 'express';
import { Response } from 'express';
import { join } from 'path';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(
    @Body('text') text: string,
    @Body('sender') sender: string,
    @Body('chatId') chatId: string,
  ): Promise<Message> {
    return this.messageService.createMessage(text, sender, chatId);
  }

  @Get(':chatId')
  async getMessagesByChatId(
    @Param('chatId') chatId: string,
  ): Promise<Message[]> {
    return this.messageService.getMessagesByChatId(chatId);
  }
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: './uploads' }),
    }),
  )
  uploadFile(@UploadedFile() file: Multer.File) {
    // Обработка загруженного файла
  }

  @Get('download/:filename')
  downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = join(__dirname, '..', 'uploads', filename);
    res.sendFile(file);
  }
}
