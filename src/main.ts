import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SocketAdapter } from './adapters/socket.adapter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    allowedHeaders: ['content-type', 'userId'],
    origin: 'http://localhost:8080',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ forbidNonWhitelisted: true }));
  app.useWebSocketAdapter(new SocketAdapter(app))
  await app.listen(3001);
}
bootstrap();
