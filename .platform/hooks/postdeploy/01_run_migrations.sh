#!/bin/bash
# Este script ejecuta las migraciones de TypeORM después del deployment
# Se ejecuta automáticamente después de cada deployment en AWS Elastic Beanstalk

set -e  # Detener si hay errores

echo "=== Ejecutando migraciones de TypeORM ==="
cd /var/app/current

# Ejecutar migraciones
echo "Ejecutando: npm run migration:run"
npm run migration:run

echo "=== Migraciones completadas exitosamente ==="
