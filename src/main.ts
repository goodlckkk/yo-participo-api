import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seguridad: Headers HTTP con Helmet
  app.use(helmet());

  // CORS: Permitir solo el frontend configurado
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4321',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true, // Transforma los tipos automáticamente
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
  console.log(`🔒 CORS habilitado para: ${process.env.FRONTEND_URL || 'http://localhost:4321'}`);
}
bootstrap();
