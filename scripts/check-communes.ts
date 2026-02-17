import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function checkCommunes() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'yo_participo',
    entities: ['src/**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    // Verificar si la tabla communes existe
    const tableExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'communes'
      )
    `);

    if (tableExists[0].exists) {
      console.log('✅ Tabla communes existe');
      
      // Contar registros
      const countResult = await dataSource.query('SELECT COUNT(*) as total FROM communes');
      console.log(`📊 Total de comunas: ${countResult[0].total}`);
      
      // Mostrar algunas comunas
      const sampleCommunes = await dataSource.query('SELECT nombre, region FROM communes LIMIT 5');
      console.log('🔍 Ejemplo de comunas:', sampleCommunes);
    } else {
      console.log('❌ Tabla communes NO existe');
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCommunes();