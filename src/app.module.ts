import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { SocketGateway } from './socket.gateway';
import { User, UserSchema } from '../models/user.model';
import { MulterConfigModule } from './multer.module';
import { UserService } from './user.service';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { SessionMiddleware } from './session.middleware';
import { RequestMethod } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://maxim17shiglov08:arZkaOpzMALgplOq@test-zadanie.wbxgfos.mongodb.net/?retryWrites=true&w=majority',
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MulterConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService, SocketGateway, UserService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)
      .forRoutes({ path: '/', method: RequestMethod.GET });
  }
}
