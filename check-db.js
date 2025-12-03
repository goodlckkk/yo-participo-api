const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
  try {
    await client.connect();
    console.log('✅ Conexión exitosa a la base de datos\n');
    
    // Verificar tablas existentes
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Tablas existentes en la BD:');
    tablesResult.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    console.log('\n');
    
    // Verificar si existe la tabla migrations
    const migrationsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      )
    `);
    
    if (migrationsCheck.rows[0].exists) {
      const migrationsResult = await client.query(`
        SELECT * FROM migrations ORDER BY timestamp DESC LIMIT 10
      `);
      
      console.log('📋 Migraciones ejecutadas:');
      migrationsResult.rows.forEach(row => {
        console.log('  -', row.name, '| timestamp:', row.timestamp);
      });
    } else {
      console.log('⚠️  La tabla migrations NO existe (ninguna migración ejecutada)');
    }
    
    // Verificar el enum de trials_status
    const enumResult = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'trials_status_enum'
    `);
    
    if (enumResult.rows.length > 0) {
      console.log('\n📊 Valores del enum trials_status_enum:');
      enumResult.rows.forEach(row => {
        console.log('  -', row.enumlabel);
      });
    } else {
      console.log('\n⚠️  El enum trials_status_enum NO existe');
    }
    
    await client.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkDatabase();
