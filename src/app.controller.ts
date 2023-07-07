import { Get, Post, Body, Controller, Render, Res, Req } from '@nestjs/common';
import { UserService } from './user.service';

@Controller()
export class AppController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @Render('index.ejs')
  root() {
    return { message: 'temp' };
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
        console.log(user);
        req.session.user = user.id;
        console.log(user.id);
        console.log(req.session.user);
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
