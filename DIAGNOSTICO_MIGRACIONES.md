# 🔍 DIAGNÓSTICO DE MIGRACIONES - YO PARTICIPO API

**Fecha:** 3 de diciembre de 2025  
**Problema:** API dejó de funcionar después de crear migraciones

---

## 🔴 PROBLEMA IDENTIFICADO

### **Causa raíz:**
La migración `1733154000000-AddRecruitmentDeadlineAndResearchSiteToTrials.ts` tenía un **ERROR CRÍTICO**:

1. **Intentaba usar CHECK constraints** en lugar de actualizar el ENUM TYPE de PostgreSQL
2. PostgreSQL ya tenía un `trials_status_enum` definido
3. La migración intentaba agregar un CHECK constraint adicional, causando conflicto
4. **Las migraciones NUNCA se ejecutaron en AWS** porque los archivos `.ebextensions` no funcionaban

### **Síntomas:**
- ✅ Health checks de AWS pasaban (200 OK)
- ❌ Endpoints de API retornaban 500 (Internal Server Error)
- ❌ Errores en logs:
  - `column Trial.recruitment_deadline does not exist`
  - `invalid input value for enum trials_status_enum: "FOLLOW_UP"`

---

## ✅ SOLUCIONES IMPLEMENTADAS

### **1. Corregida la migración problemática**

**Archivo:** `src/migrations/1733154000000-AddRecruitmentDeadlineAndResearchSiteToTrials.ts`

**Cambio:**
```typescript
// ❌ ANTES (INCORRECTO):
await queryRunner.query(`
  ALTER TABLE trials 
  ADD CONSTRAINT trials_status_check 
  CHECK (status IN ('PREPARATION', 'RECRUITING', 'FOLLOW_UP', 'CLOSED'));
`);

// ✅ AHORA (CORRECTO):
await queryRunner.query(`
  ALTER TYPE trials_status_enum ADD VALUE IF NOT EXISTS 'PREPARATION';
`);

await queryRunner.query(`
  ALTER TYPE trials_status_enum ADD VALUE IF NOT EXISTS 'FOLLOW_UP';
`);
```

**Explicación:**
- PostgreSQL usa ENUM TYPES, no CHECK constraints para enums
- `ADD VALUE IF NOT EXISTS` es idempotente (se puede ejecutar múltiples veces sin error)
- Actualiza correctamente el enum existente sin recrearlo

### **2. Reemplazados `.ebextensions` por hooks de `predeploy`**

**Archivos eliminados:**
- `.ebextensions/00_pre_migration_check.config` ❌
- `.ebextensions/01_run_migrations.config` ❌
- `.platform/hooks/postdeploy/01_run_migrations.sh` ❌

**Archivos creados:**
- `.platform/hooks/predeploy/00_check_migrations.sh` ✅ (diagnóstico)
- `.platform/hooks/predeploy/01_run_migrations.sh` ✅ (ejecuta migraciones)

**Razón:**
- AWS Elastic Beanstalk **NO estaba ejecutando** los `container_commands` de `.ebextensions`
- Los hooks de `predeploy` se ejecutan **ANTES** de que la aplicación se inicie
- Son más confiables y tienen mejor logging

### **3. Agregado script de diagnóstico**

**Archivo:** `.platform/hooks/predeploy/00_check_migrations.sh`

**Funcionalidad:**
- Verifica conexión a la base de datos
- Lista las migraciones ejecutadas
- Verifica si las columnas nuevas existen
- Muestra los valores del enum `trials_status_enum`
- **Se ejecuta ANTES de las migraciones** para diagnosticar el estado

---

## 📋 LISTA DE MIGRACIONES (EN ORDEN)

1. ✅ `1733150000000-UpdateTrialStatusFromActiveToFollowUp.ts`
   - Actualiza registros con `ACTIVE` → `FOLLOW_UP`
   - **Estado:** Correcta

2. ✅ `1733154000000-AddRecruitmentDeadlineAndResearchSiteToTrials.ts`
   - Agrega columnas: `recruitment_deadline`, `research_site_url`, `research_site_name`
   - Actualiza enum para incluir `PREPARATION` y `FOLLOW_UP`
   - **Estado:** CORREGIDA (era la problemática)

3. ✅ `1733155000000-AddSponsorTypeToSponsors.ts`
   - Agrega columna `sponsor_type` a tabla `sponsors`
   - **Estado:** Correcta

4. ✅ `1733156000000-AddSourceToPatientIntakes.ts`
   - Agrega columna `source` a tabla `patient_intakes`
   - **Estado:** Correcta

5. ✅ `1733158000000-CreateResearchSitesTable.ts`
   - Crea tabla `research_sites`
   - **Estado:** Correcta

6. ✅ `1733159000000-CreateCie10Table.ts`
   - Crea tabla `cie10_codes`
   - **Estado:** Correcta

7. ✅ `1733160000000-AddCie10ToPatientIntake.ts`
   - Agrega relación con CIE-10 en `patient_intakes`
   - **Estado:** Correcta

8. ✅ `1733161000000-AddSeparatePhoneFieldsToPatientIntake.ts`
   - Separa campo `telefono` en `telefonoCodigoPais` y `telefonoNumero`
   - **Estado:** Correcta

---

## 🚀 PRÓXIMOS PASOS

### **Para el desarrollador:**

1. **Hacer commit de los cambios:**
   ```bash
   git add .
   git commit -m "fix: correct enum migration and replace .ebextensions with predeploy hooks"
   ```

2. **Pushear a GitHub:**
   ```bash
   git push origin feature/add-migration-bdo
   ```

3. **Esperar el deployment automático de AWS**

### **Verificación post-deployment:**

1. **Revisar logs de deployment:**
   - `/var/log/eb-engine.log` debe mostrar la ejecución de los hooks
   - Buscar líneas con "DIAGNÓSTICO DE MIGRACIONES"
   - Buscar líneas con "EJECUTANDO MIGRACIONES DE TYPEORM"

2. **Verificar que las migraciones se ejecutaron:**
   - El script `00_check_migrations.sh` mostrará:
     - ✅ Columnas nuevas en tabla `trials`
     - ✅ Valores `PREPARATION` y `FOLLOW_UP` en el enum
     - ✅ Últimas migraciones registradas en tabla `migrations`

3. **Probar los endpoints:**
   - `GET /api/trials` debe retornar 200 (no 500)
   - `GET /api/stats/public` debe retornar 200 (no 500)
   - Frontend debe cargar datos correctamente

---

## 📊 CÓMO VERIFICAR SI LAS MIGRACIONES SE EJECUTARON EN AWS

### **Opción 1: Revisar logs de deployment**

```bash
eb ssh
tail -n 200 /var/log/eb-engine.log | grep -A 20 "DIAGNÓSTICO DE MIGRACIONES"
```

Deberías ver:
```
========================================
DIAGNÓSTICO DE MIGRACIONES
========================================
✅ Conexión a BD exitosa
📊 PostgreSQL version: ...
✅ Tabla migrations existe
📋 Últimas migraciones ejecutadas:
  - AddSeparatePhoneFieldsToPatientIntake (timestamp: 1733161000000)
  - AddCie10ToPatientIntake (timestamp: 1733160000000)
  ...
📊 Columnas nuevas en tabla trials:
  ✅ recruitment_deadline : date
  ✅ research_site_url : character varying
  ✅ research_site_name : character varying
📊 Valores del enum trials_status_enum:
  - RECRUITING
  - CLOSED
  - PREPARATION
  - FOLLOW_UP
```

### **Opción 2: Conectarse a la base de datos directamente**

```bash
# Desde tu máquina local
psql -h <DB_HOST> -U <DB_USERNAME> -d <DB_DATABASE>

# Verificar migraciones ejecutadas
SELECT * FROM migrations ORDER BY timestamp DESC;

# Verificar columnas de trials
\d trials

# Verificar valores del enum
SELECT enumlabel FROM pg_enum 
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
WHERE pg_type.typname = 'trials_status_enum';
```

---

## 🎯 RESUMEN

### **¿Por qué dejó de funcionar?**
1. Las migraciones tenían un error (CHECK constraint en lugar de actualizar ENUM)
2. Los archivos `.ebextensions` no se ejecutaban en AWS
3. La base de datos quedó desactualizada respecto al código

### **¿Qué se hizo?**
1. Se corrigió la migración problemática
2. Se reemplazaron `.ebextensions` por hooks de `predeploy`
3. Se agregó un script de diagnóstico para verificar el estado

### **¿Cómo se verifica?**
1. Revisar logs de deployment
2. Verificar que el script de diagnóstico muestra las columnas y enum actualizados
3. Probar los endpoints de la API

---

**Estado actual:** ✅ LISTO PARA DEPLOYMENT
