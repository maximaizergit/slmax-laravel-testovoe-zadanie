import {
  Get,
  Post,
  Body,
  Controller,
  Render,
  Param,
  Res,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { GroupChatService } from './groupchat.service';
import * as fs from 'fs';

import { Response } from 'express';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(
    private readonly userService: UserService,
    private readonly groupChatService: GroupChatService,
  ) {}

  @Get()
  @Render('index.ejs')
  async root(@Res() res, @Req() req) {
    const sessionData = {
      userId: req.session.user.id,
      username: req.session.user.name,
    };

    return { data: sessionData };
  }

  @Get('downloads/:filename')
  downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(__dirname, '..', '..', filename);
    const contentType = this.getContentType(filename);

    // Устанавливаем тип контента
    res.setHeader('Content-Type', contentType);

    // Создаем поток чтения файла
    const fileStream = fs.createReadStream(filePath);

    // Подключаем поток чтения к ответу клиента
    fileStream.pipe(res);
  }

  private getContentType(filename: string): string {
    // Определяем тип контента на основе расширения файла
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';

      default:
        return 'application/octet-stream';
    }
  }
  @Get('login')
  @Render('login.ejs')
  login() {
    return { Email: '' };
  }
  @Get('logout')
  logout(@Res() res, @Req() req) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/login');
    });
  }

  @Post('login')
  async auth(
    @Body() data: { email: string; password: string },
    @Res() res,
    @Req() req,
  ) {
    try {
      const user = await this.userService.findUserByEmailAndPassword(
        data.email,
        data.password,
      );

      if (user) {
        req.session.user = {
          id: user.id,
          name: user.name,
        };

        return res.redirect('/');
      } else {
        return res.render('login', {
          error: 'Неверные учетные данные',
          Email: data.email,
        });
      }
    } catch (error) {
      return res.render('login', {
        error: error.message,
        Email: data.email,
      });
    }
  }

  @Post('creategroupchat')
  async createGroupChat(@Body('name') name: string) {
    await this.groupChatService.createGroupChat(name);
  }

  @Get('registration')
  @Render('registration.ejs')
  registration() {
    return { Email: '', Name: '' };
  }

  @Post('registration')
  async register(
    @Body() data: { email: string; name: string; password: string },
    @Res() res,
  ) {
    try {
      const existingName = await this.userService.findUserByName(data.name);
      if (existingName) {
        return res.render('registration', {
          error: 'Данное имя уже занято',
          Name: data.name,
          Email: data.email,
        });
      }

      const existingEmail = await this.userService.findUserByEmail(data.email);
      if (existingEmail) {
        return res.render('registration', {
          error: 'Данная почта уже занята',
          Name: data.name,
          Email: data.email,
        });
      }

      await this.userService.createUser(data.name, data.email, data.password);

      return res.redirect('/login');
    } catch (error) {
      // Обработка ошибок и рендеринг соответствующего сообщения
      return res.render('registration', {
        error: error.message,
        Name: data.name,
        Email: data.email,
      });
    }
  }
}
