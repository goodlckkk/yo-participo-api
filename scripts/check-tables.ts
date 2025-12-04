import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false
  },
});

async function checkTables() {
  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    // Verificar tabla hero_slides
    const heroSlidesExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'hero_slides'
      );
    `);
    
    console.log('📊 Tabla hero_slides:', heroSlidesExists[0].exists ? '✅ EXISTE' : '❌ NO EXISTE');

    if (heroSlidesExists[0].exists) {
      const heroSlidesCount = await dataSource.query('SELECT COUNT(*) FROM hero_slides');
      console.log(`   Registros: ${heroSlidesCount[0].count}`);
      
      const heroSlidesColumns = await dataSource.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'hero_slides'
        ORDER BY ordinal_position;
      `);
      console.log('   Columnas:', heroSlidesColumns.map((c: any) => c.column_name).join(', '));
    }

    console.log('');

    // Verificar tabla success_stories
    const successStoriesExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'success_stories'
      );
    `);
    
    console.log('📊 Tabla success_stories:', successStoriesExists[0].exists ? '✅ EXISTE' : '❌ NO EXISTE');

    if (successStoriesExists[0].exists) {
      const successStoriesCount = await dataSource.query('SELECT COUNT(*) FROM success_stories');
      console.log(`   Registros: ${successStoriesCount[0].count}`);
      
      const successStoriesColumns = await dataSource.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'success_stories'
        ORDER BY ordinal_position;
      `);
      console.log('   Columnas:', successStoriesColumns.map((c: any) => c.column_name).join(', '));
    }

    await dataSource.destroy();
    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkTables();
