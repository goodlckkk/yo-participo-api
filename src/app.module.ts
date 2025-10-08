import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // 1. Módulo para cargar variables de entorno (.env)
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables estén disponibles en toda la app
    }),

    // 2. Módulo de TypeORM para la conexión a la base de datos
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [], // Dejaremos esto vacío por ahora
      synchronize: true, // En desarrollo, crea las tablas automáticamente. ¡No usar en producción!
      ssl: {
        rejectUnauthorized: false,
      },
    }),   
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}