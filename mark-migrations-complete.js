const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: false }
});

// Migraciones que se ejecutaron parcialmente pero dejaron cambios
const migrations = [
  { timestamp: 1733154000000, name: 'AddRecruitmentDeadlineAndResearchSiteToTrials1733154000000' },
  { timestamp: 1733155000000, name: 'AddSponsorTypeToSponsors1733155000000' },
  { timestamp: 1733156000000, name: 'AddSourceToPatientIntakes1733156000000' },
  { timestamp: 1733158000000, name: 'CreateResearchSitesTable1733158000000' },
  { timestamp: 1733159000000, name: 'CreateCie10Table1733159000000' },
  { timestamp: 1733160000000, name: 'AddCie10ToPatientIntake1733160000000' },
];

async function markMigrationsComplete() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');
    
    for (const migration of migrations) {
      // Verificar si ya está registrada
      const check = await client.query(
        'SELECT * FROM migrations WHERE timestamp = $1',
        [migration.timestamp]
      );
      
      if (check.rows.length > 0) {
        console.log(`⏭️  ${migration.name} ya está registrada`);
      } else {
        await client.query(
          'INSERT INTO migrations (timestamp, name) VALUES ($1, $2)',
          [migration.timestamp, migration.name]
        );
        console.log(`✅ ${migration.name} marcada como completada`);
      }
    }
    
    console.log('\n✅ Proceso completado');
    await client.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

markMigrationsComplete();
