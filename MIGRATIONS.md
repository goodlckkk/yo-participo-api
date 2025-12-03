# 🗃️ Guía de Migraciones - Yo Participo API

## 📋 Comandos Disponibles

### Ejecutar migraciones pendientes
```bash
npm run migration:run
```

### Revertir última migración
```bash
npm run migration:revert
```

### Ver estado de migraciones
```bash
npm run migration:show
```

---

## 🚀 Deploy en AWS Elastic Beanstalk

### Migraciones Automáticas

Las migraciones se ejecutan **automáticamente** durante el deploy gracias al archivo `.ebextensions/01_run_migrations.config`.

**Flujo de deploy:**
1. Git push a main
2. Elastic Beanstalk detecta cambios
3. Instala dependencias (`npm install`)
4. Ejecuta build (`npm run build`)
5. **Ejecuta migraciones** (`npm run migration:run`) ← AUTOMÁTICO
6. Inicia la aplicación

### Verificar ejecución

**AWS Console:**
```
Elastic Beanstalk → Environments → Logs → Request Logs → Last 100 Lines
Buscar: "npm run migration:run"
```

**EB CLI:**
```bash
eb logs --all | grep -A 10 "migration"
```

---

## 🔧 Ejecutar Migraciones Manualmente

### Desde tu máquina local (conectando a RDS)

```bash
# 1. Configurar variables de entorno
export DB_HOST=tu-rds-endpoint.rds.amazonaws.com
export DB_PORT=5432
export DB_USERNAME=tu_usuario
export DB_PASSWORD=tu_password
export DB_DATABASE=yo_participo
export DB_SSL=true

# 2. Ejecutar migraciones
npm run migration:run
```

⚠️ **IMPORTANTE:** Tu IP debe estar en el Security Group de RDS.

### Desde EC2 (SSH)

```bash
# 1. Conectar a la instancia
eb ssh

# 2. Ir al directorio de la app
cd /var/app/current

# 3. Ejecutar migraciones
sudo npm run migration:run

# 4. Salir
exit
```

---

## 📦 Migraciones Actuales

### 1. AddRecruitmentDeadlineAndResearchSiteToTrials
**Archivo:** `1733151000000-AddRecruitmentDeadlineAndResearchSiteToTrials.ts`

**Cambios:**
- Agrega `recruitment_deadline` (timestamp nullable)
- Agrega `research_site_name` (varchar 255 nullable)
- Agrega `research_site_url` (varchar 500 nullable)

**Tabla afectada:** `trials`

---

### 2. AddSponsorTypeToSponsors
**Archivo:** `1733152000000-AddSponsorTypeToSponsors.ts`

**Cambios:**
- Agrega columna `sponsor_type` (enum: SPONSOR, CRO)
- Valor por defecto: 'SPONSOR'
- Actualiza registros existentes a 'SPONSOR'

**Tabla afectada:** `sponsors`

---

### 3. AddSourceToPatientIntakes
**Archivo:** `1733153000000-AddSourceToPatientIntakes.ts`

**Cambios:**
- Agrega columna `source` (enum: WEB, MANUAL, REFERRAL)
- Valor por defecto: 'WEB'
- Actualiza registros existentes a 'WEB'

**Tabla afectada:** `patient_intakes`

---

## 🔒 Seguridad

### Agregar IP al Security Group de RDS

**AWS Console:**
```
1. RDS → Databases → tu-database
2. Connectivity & security → Security Group
3. Inbound rules → Edit inbound rules
4. Add rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: My IP
5. Save rules
```

**AWS CLI:**
```bash
MY_IP=$(curl -s https://checkip.amazonaws.com)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 5432 \
  --cidr $MY_IP/32
```

---

## ⚠️ Troubleshooting

### Error: "Migration already executed"
✅ **Normal** - La migración ya corrió anteriormente. Ignorar.

### Error: "Cannot connect to database"
🔴 **Problema:** Security Group no permite conexión  
✅ **Solución:** Agregar IP al Security Group (ver arriba)

### Error: "column already exists"
🔴 **Problema:** Migración corrió parcialmente  
✅ **Solución:** 
```bash
# Revertir migración
npm run migration:revert

# Volver a ejecutar
npm run migration:run
```

### Deploy falla en Elastic Beanstalk
🔴 **Problema:** Migración falla durante deploy  
✅ **Solución:**
1. Ver logs: `eb logs --all`
2. Ejecutar migración manualmente desde EC2
3. Re-deploy: `git push origin main`

---

## 📝 Crear Nueva Migración

```bash
# Generar migración automáticamente
npm run typeorm migration:generate -- src/migrations/NombreDeLaMigracion

# O crear vacía
npm run typeorm migration:create -- src/migrations/NombreDeLaMigracion
```

---

## 🎯 Checklist Pre-Deploy

- [ ] Migraciones creadas en `src/migrations/`
- [ ] Scripts en `package.json` configurados
- [ ] Archivo `.ebextensions/01_run_migrations.config` existe
- [ ] Variables de entorno configuradas en EB
- [ ] Build local exitoso (`npm run build`)
- [ ] Migraciones probadas localmente (`npm run migration:run`)

---

**🎉 Con esta configuración, las migraciones se ejecutan automáticamente en cada deploy.**
