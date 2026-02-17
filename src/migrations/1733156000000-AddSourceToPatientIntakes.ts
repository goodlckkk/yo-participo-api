import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migración para agregar el campo source a la tabla patient_intakes
 *
 * Este campo permite distinguir el origen de la postulación:
 * - WEB: Creado a través del formulario público web
 * - MANUAL: Creado manualmente por un administrador en el dashboard
 * - REFERRAL: Referido por un médico u otra fuente (futuro)
 *
 * Fecha: 2025-12-02
 * Relacionado con: Requerimiento - Distinguir pacientes manuales vs web
 */
export class AddSourceToPatientIntakes1733156000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar columna source con valor por defecto 'WEB'
    await queryRunner.addColumn(
      'patient_intakes',
      new TableColumn({
        name: 'source',
        type: 'varchar',
        length: '50',
        default: "'WEB'",
        isNullable: false,
        comment: 'Origen de la postulación: WEB, MANUAL o REFERRAL',
      }),
    );

    // 2. Agregar constraint para validar los valores permitidos
    await queryRunner.query(`
      ALTER TABLE patient_intakes 
      ADD CONSTRAINT patient_intakes_source_check 
      CHECK (source IN ('WEB', 'MANUAL', 'REFERRAL'));
    `);

    // 3. Actualizar registros existentes para que tengan source = 'WEB'
    // (ya lo hace el default, pero lo hacemos explícito por claridad)
    await queryRunner.query(`
      UPDATE patient_intakes 
      SET source = 'WEB' 
      WHERE source IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir constraint
    await queryRunner.query(`
      ALTER TABLE patient_intakes 
      DROP CONSTRAINT IF EXISTS patient_intakes_source_check;
    `);

    // Eliminar columna
    await queryRunner.dropColumn('patient_intakes', 'source');
  }
}
