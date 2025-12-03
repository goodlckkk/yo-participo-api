const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: false }
});

async function checkPhones() {
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        id,
        telefono,
        CASE
          WHEN telefono LIKE '+%' THEN
            SUBSTRING(telefono FROM 1 FOR POSITION(' ' IN telefono || ' ') - 1)
          ELSE '+56'
        END as codigo_pais_extraido,
        LENGTH(CASE
          WHEN telefono LIKE '+%' THEN
            SUBSTRING(telefono FROM 1 FOR POSITION(' ' IN telefono || ' ') - 1)
          ELSE '+56'
        END) as longitud_codigo
      FROM patient_intakes 
      WHERE telefono IS NOT NULL
      LIMIT 10
    `);
    
    console.log('📱 Teléfonos en la BD:');
    result.rows.forEach(row => {
      console.log(`  ID: ${row.id}`);
      console.log(`    Teléfono: ${row.telefono}`);
      console.log(`    Código país extraído: ${row.codigo_pais_extraido}`);
      console.log(`    Longitud: ${row.longitud_codigo}`);
      console.log('');
    });
    
    await client.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkPhones();
