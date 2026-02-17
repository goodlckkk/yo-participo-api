import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar prefijo global 'api' pero excluir el endpoint raíz para health checks
  app.setGlobalPrefix('api', {
    exclude: ['/', 'health'],
  });

  // Seguridad con Helmet
  app.use(helmet());

  // CORS: Permitir múltiples orígenes
  const allowedOrigins = [
    'https://yoparticipo.cl',
    'https://www.yoparticipo.cl',
    'https://main.dcktii2mmd8u8.amplifyapp.com',
    'http://localhost:4321',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (health checks, Postman, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Normalizar origin (quitar barra final si existe)
      const normalizedOrigin = origin.endsWith('/')
        ? origin.slice(0, -1)
        : origin;

      // Verificar si el origin está permitido
      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Origin bloqueado: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
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
  console.log(
    `🔒 CORS habilitado para: ${process.env.FRONTEND_URL || 'http://localhost:4321'}`,
  );
}
bootstrap();
