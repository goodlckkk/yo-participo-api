import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

/**
 * Configuración de TypeORM para PRODUCCIÓN (migraciones)
 *
 * A diferencia de typeorm.config.ts (que usa ts-node para desarrollo),
 * este archivo se compila a JS y se ejecuta directamente con el CLI de TypeORM
 * sin necesidad de ts-node.
 *
 * Las rutas apuntan a los archivos compilados en dist/ porque en producción
 * no está disponible ts-node (es devDependency).
 *
 * Uso:
 *   npx typeorm migration:run -d dist/config/typeorm.config.prod.js
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'yo_participo',
  // En producción, las migraciones están compiladas en dist/migrations/
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  logging: true,
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});
