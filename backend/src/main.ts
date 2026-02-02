import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      //loai bo du lieu thua user gui
      whitelist: true,
      //neu user co gui du lieu la - bao loi
      forbidNonWhitelisted: true,
      //auto convert du lieu dung type - str > num
      transform: true,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:5173', // frontend Vite
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
