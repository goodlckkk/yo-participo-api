#!/bin/bash
# Hook de predeploy para ejecutar migraciones de TypeORM
# Se ejecuta ANTES de que la aplicación se inicie

# TEMPORALMENTE DESHABILITADO - Configurar Security Group primero
echo "========================================="
echo "MIGRACIONES DESHABILITADAS TEMPORALMENTE"
echo "Configurar Security Group de RDS antes de habilitar"
echo "========================================="
exit 0

set -e  # Detener si hay errores

echo "========================================="
echo "EJECUTANDO MIGRACIONES DE TYPEORM"
echo "========================================="

cd /var/app/staging

echo "Directorio actual: $(pwd)"
echo "Contenido del directorio:"
ls -la

echo ""
echo "Instalando dependencias..."
npm ci --only=production

echo ""
echo "Ejecutando migraciones..."
npm run migration:run

echo ""
echo "========================================="
echo "MIGRACIONES COMPLETADAS EXITOSAMENTE"
echo "========================================="
