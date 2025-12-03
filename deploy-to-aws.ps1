# Script para deployar correctamente a AWS Elastic Beanstalk
# SOLUCIÓN AL ERROR: Cannot find module '/var/app/current/dist/main.js'

Write-Host "🚀 Iniciando deployment a AWS Elastic Beanstalk..." -ForegroundColor Cyan
Write-Host "   Ambiente: Yoparticipo-api-env-1" -ForegroundColor Gray

# 1. Compilar el código
Write-Host "`n📦 Paso 1/3: Compilando código TypeScript..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar. Revisa los errores arriba." -ForegroundColor Red
    exit 1
}

# 2. Verificar que dist/src/main.js existe (NestJS compila a dist/src/)
if (-not (Test-Path "dist/src/main.js")) {
    Write-Host "❌ Error: dist/src/main.js no existe después de compilar" -ForegroundColor Red
    Write-Host "   Verifica que nest-cli.json esté configurado correctamente" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Compilación exitosa! Archivo dist/src/main.js verificado" -ForegroundColor Green

# 3. Hacer deployment
Write-Host "`n🌐 Paso 2/3: Haciendo deployment a AWS..." -ForegroundColor Yellow
Write-Host "   Esto puede tomar 2-3 minutos..." -ForegroundColor Gray

eb deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en deployment" -ForegroundColor Red
    Write-Host "   Ejecuta 'eb logs' para ver detalles" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ ¡Deployment completado!" -ForegroundColor Green

# 4. Verificar estado
Write-Host "`n📊 Paso 3/3: Verificando estado del ambiente..." -ForegroundColor Yellow
eb status

Write-Host "`n✅ DEPLOYMENT EXITOSO!" -ForegroundColor Green
Write-Host "`nPróximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Verificar API: https://api.yoparticipo.cl/" -ForegroundColor White
Write-Host "  2. Ver logs:     eb logs --stream" -ForegroundColor White
Write-Host "  3. Ver health:   eb health" -ForegroundColor White
