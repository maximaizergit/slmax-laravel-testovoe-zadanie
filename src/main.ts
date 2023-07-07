// main.ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as session from 'express-session';
import * as connectMongoDBSession from 'connect-mongodb-session';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(path.join(__dirname, '..', '..', 'views'));

  app.useStaticAssets(path.join(__dirname, '..', 'public'));

  app.setViewEngine('ejs');

  const expressApp = app.getHttpAdapter().getInstance();
  const MongoDBStore = connectMongoDBSession(session);
  const store = new MongoDBStore({
    uri: 'mongodb+srv://maxim17shiglov08:arZkaOpzMALgplOq@test-zadanie.wbxgfos.mongodb.net/?retryWrites=true&w=majority',
    collection: 'sessions',
  });
  expressApp.use(
    session({
      secret:
        'd0d96651c9fffb09106a3b648cdcb84b4e03707c17927fc76004536daac06d7a',
      resave: false,
      saveUninitialized: false,
      store: store,
    }),
  );
  await app.listen(3000);
}
bootstrap();
