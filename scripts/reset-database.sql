-- Script para resetear la base de datos en desarrollo
-- ⚠️ ADVERTENCIA: Esto eliminará TODOS los datos. Solo usar en desarrollo.

-- Eliminar tablas en orden (respetando foreign keys)
DROP TABLE IF EXISTS patient_intakes CASCADE;
DROP TABLE IF EXISTS participations CASCADE;
DROP TABLE IF EXISTS trials CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sponsors CASCADE;

-- Las tablas se recrearán automáticamente cuando inicies la aplicación
-- con synchronize: true en desarrollo
