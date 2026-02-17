import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para agregar campos CIE-10 a PatientIntake
 * 
 * CAMBIOS:
 * 1. Agregar columna codigos_cie10 (jsonb) - Array de códigos CIE-10
 * 2. Agregar columna otrasEnfermedades (text) - Texto libre para otras condiciones
 * 
 * Estos campos permiten clasificación estandarizada de enfermedades
 * para mejorar el matching con ensayos clínicos.
 * 
 * Fecha: 2025-12-02
 * Relacionado con: Sistema CIE-10 para clasificación de enfermedades
 */
export class AddCie10ToPatientIntake1733160000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar columna codigos_cie10
    await queryRunner.query(`
      ALTER TABLE patient_intakes 
      ADD COLUMN codigos_cie10 jsonb NULL;
    `);

    // 2. Agregar columna otrasEnfermedades
    await queryRunner.query(`
      ALTER TABLE patient_intakes 
      ADD COLUMN "otrasEnfermedades" text NULL;
    `);

    // 3. Comentarios en las columnas para documentación
    await queryRunner.query(`
      COMMENT ON COLUMN patient_intakes.codigos_cie10 IS 
      'Array de códigos CIE-10 de las enfermedades del paciente (ej: ["E11.9", "I10"])';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN patient_intakes."otrasEnfermedades" IS 
      'Otras enfermedades en texto libre que no tienen código CIE-10 asignado';
    `);

    console.log('✅ Migración: Campos CIE-10 agregados a patient_intakes');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar columnas
    await queryRunner.query(`
      ALTER TABLE patient_intakes 
      DROP COLUMN IF EXISTS "otrasEnfermedades";
    `);

    await queryRunner.query(`
      ALTER TABLE patient_intakes 
      DROP COLUMN IF EXISTS codigos_cie10;
    `);

    console.log('⏪ Revertido: Campos CIE-10 eliminados de patient_intakes');
  }
}
