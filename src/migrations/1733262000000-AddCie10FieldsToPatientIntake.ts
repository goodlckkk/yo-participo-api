import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migración: Agregar campos CIE-10 a patient_intakes
 * 
 * Agrega:
 * - condicionPrincipalCodigo: Código CIE-10 de la condición principal
 * - patologias: Array JSONB de patologías prevalentes seleccionadas
 * 
 * Estos campos permiten una mejor clasificación de enfermedades y matching
 * con ensayos clínicos basado en códigos estandarizados CIE-10.
 */
export class AddCie10FieldsToPatientIntake1733262000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna condicionPrincipalCodigo
    await queryRunner.addColumn(
      'patient_intakes',
      new TableColumn({
        name: 'condicionPrincipalCodigo',
        type: 'varchar',
        length: '20',
        isNullable: true,
        comment: 'Código CIE-10 de la condición principal (ej: E11.9 para Diabetes tipo 2)',
      }),
    );

    // Agregar columna patologias
    await queryRunner.addColumn(
      'patient_intakes',
      new TableColumn({
        name: 'patologias',
        type: 'jsonb',
        isNullable: true,
        comment: 'Array de patologías prevalentes seleccionadas (checkboxes)',
      }),
    );

    console.log('✅ Columnas condicionPrincipalCodigo y patologias agregadas a patient_intakes');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir: eliminar columnas
    await queryRunner.dropColumn('patient_intakes', 'patologias');
    await queryRunner.dropColumn('patient_intakes', 'condicionPrincipalCodigo');

    console.log('✅ Columnas condicionPrincipalCodigo y patologias eliminadas de patient_intakes');
  }
}
