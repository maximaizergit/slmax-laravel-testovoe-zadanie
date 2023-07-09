import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as session from 'express-session';
import * as connectMongoDBSession from 'connect-mongodb-session';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(path.join(__dirname, '..', '..', 'views'));

  app.useStaticAssets(path.join(__dirname, '..', '..', 'avatar-uploads'), {
    index: false,
    prefix: '/avatar-uploads',
  });
  app.useStaticAssets(path.join(__dirname, '..', '..', 'uploads'), {
    index: false,
    prefix: '/uploads',
  });
  app.setViewEngine('ejs');

  const expressApp = app.getHttpAdapter().getInstance();
  const MongoDBStore = connectMongoDBSession(session);
  const store = new MongoDBStore({
    uri: process.env.DB_CONNECTION_STRING,
    collection: 'sessions',
  });
  expressApp.use(
    session({
      secret: process.env.SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      store: store,
    }),
  );

  await app.listen(3000);
}
bootstrap();
