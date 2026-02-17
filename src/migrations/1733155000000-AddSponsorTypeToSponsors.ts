import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migración para agregar el campo sponsor_type a la tabla sponsors
 *
 * Este campo permite distinguir entre:
 * - SPONSOR: Patrocinador directo del estudio clínico
 * - CRO: Contract Research Organization (Organización de Investigación por Contrato)
 *
 * Fecha: 2025-12-02
 * Relacionado con: Feedback - Mejoras en patrocinadores
 */
export class AddSponsorTypeToSponsors1733155000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar columna sponsor_type con valor por defecto 'SPONSOR'
    await queryRunner.addColumn(
      'sponsors',
      new TableColumn({
        name: 'sponsor_type',
        type: 'varchar',
        length: '50',
        default: "'SPONSOR'",
        isNullable: false,
        comment: 'Tipo de patrocinador: SPONSOR o CRO',
      }),
    );

    // 2. Agregar constraint para validar los valores permitidos
    await queryRunner.query(`
      ALTER TABLE sponsors 
      ADD CONSTRAINT sponsors_type_check 
      CHECK (sponsor_type IN ('SPONSOR', 'CRO'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir constraint
    await queryRunner.query(`
      ALTER TABLE sponsors 
      DROP CONSTRAINT IF EXISTS sponsors_type_check;
    `);

    // Eliminar columna
    await queryRunner.dropColumn('sponsors', 'sponsor_type');
  }
}
