#!/bin/bash
# Script de diagnóstico para verificar el estado de las migraciones

set -e

echo "========================================="
echo "DIAGNÓSTICO DE MIGRACIONES"
echo "========================================="

cd /var/app/staging

echo ""
echo "1. Verificando conexión a la base de datos..."
node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('✅ Conexión a BD exitosa');
    return client.query('SELECT version()');
  })
  .then(result => {
    console.log('📊 PostgreSQL version:', result.rows[0].version);
    return client.query(\`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'migrations'
    \`);
  })
  .then(result => {
    if (result.rows.length > 0) {
      console.log('✅ Tabla migrations existe');
      return client.query('SELECT * FROM migrations ORDER BY timestamp DESC LIMIT 5');
    } else {
      console.log('⚠️  Tabla migrations NO existe');
      return { rows: [] };
    }
  })
  .then(result => {
    if (result.rows.length > 0) {
      console.log('📋 Últimas migraciones ejecutadas:');
      result.rows.forEach(row => {
        console.log('  -', row.name, '(timestamp:', row.timestamp, ')');
      });
    } else {
      console.log('⚠️  No hay migraciones registradas');
    }
    return client.query(\`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'trials' 
      AND column_name IN ('recruitment_deadline', 'research_site_url', 'research_site_name')
    \`);
  })
  .then(result => {
    console.log('');
    console.log('📊 Columnas nuevas en tabla trials:');
    if (result.rows.length > 0) {
      result.rows.forEach(row => {
        console.log('  ✅', row.column_name, ':', row.data_type);
      });
    } else {
      console.log('  ❌ No se encontraron las columnas nuevas');
    }
    return client.query(\`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'trials_status_enum'
    \`);
  })
  .then(result => {
    console.log('');
    console.log('📊 Valores del enum trials_status_enum:');
    result.rows.forEach(row => {
      console.log('  -', row.enumlabel);
    });
    return client.end();
  })
  .then(() => {
    console.log('');
    console.log('✅ Diagnóstico completado');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
"

echo ""
echo "========================================="
