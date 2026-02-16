import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

/**
 * Configuración de TypeORM para migraciones
 * 
 * Este archivo es usado por el CLI de TypeORM para ejecutar migraciones.
 * Las variables de entorno deben estar configuradas en .env o en el sistema.
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'yo_participo',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false, // NUNCA true en producción
  logging: process.env.NODE_ENV !== 'production',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
});
