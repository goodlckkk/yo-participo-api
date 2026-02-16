import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conexión a la base de datos exitosa');
    await dataSource.destroy();
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.code === '28000') {
      console.log('\n🔧 Solución necesaria:');
      console.log('1. Accede a AWS Console → RDS');
      console.log('2. Ve a tu instancia db-yoparticipo-prod');
      console.log('3. Edita el grupo de seguridad');
      console.log('4. Agrega una regla para tu IP:', '179.57.13.156/32');
      console.log('5. Puerto: 5432, Protocolo: TCP');
    }
    
    return false;
  }
}

testConnection();