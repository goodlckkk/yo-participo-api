import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migración para agregar campo comuna a research_sites
 * 
 * CAMBIOS:
 * 1. Agregar columna comuna a research_sites
 * 
 * Fecha: 2025-12-04
 * Relacionado con: Mejorar información de ubicación de instituciones
 */
export class AddComunaToResearchSites1733265000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'research_sites',
      new TableColumn({
        name: 'comuna',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    console.log('✅ Migración: Campo comuna agregado a research_sites');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('research_sites', 'comuna');

    console.log('⏪ Revertido: Campo comuna eliminado de research_sites');
  }
}
