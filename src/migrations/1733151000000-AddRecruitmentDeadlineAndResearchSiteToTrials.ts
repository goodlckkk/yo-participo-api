import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migración para agregar campos nuevos a la tabla trials:
 * 1. recruitment_deadline - Fecha límite para reclutamiento
 * 2. research_site_url - URL del sitio de investigación
 * 3. research_site_name - Nombre del sitio de investigación
 * 4. Actualizar enum de status para incluir PREPARATION y FOLLOW_UP
 * 
 * Fecha: 2025-12-02
 * Relacionado con: Feedback - Mejoras en estudios clínicos
 */
export class AddRecruitmentDeadlineAndResearchSiteToTrials1733151000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar columna recruitment_deadline
    await queryRunner.addColumn(
      'trials',
      new TableColumn({
        name: 'recruitment_deadline',
        type: 'date',
        isNullable: true,
        comment: 'Fecha límite para el reclutamiento de participantes',
      }),
    );

    // 2. Agregar columna research_site_url
    await queryRunner.addColumn(
      'trials',
      new TableColumn({
        name: 'research_site_url',
        type: 'varchar',
        length: '500',
        isNullable: true,
        comment: 'URL del sitio web del centro de investigación',
      }),
    );

    // 3. Agregar columna research_site_name
    await queryRunner.addColumn(
      'trials',
      new TableColumn({
        name: 'research_site_name',
        type: 'varchar',
        length: '255',
        isNullable: true,
        comment: 'Nombre del sitio/centro de investigación',
      }),
    );

    // 4. Actualizar el enum de status para incluir los nuevos estados
    // Primero, eliminar la restricción del enum existente
    await queryRunner.query(`
      ALTER TABLE trials 
      ALTER COLUMN status TYPE varchar(50);
    `);

    // Actualizar valores existentes si es necesario
    // ACTIVE -> FOLLOW_UP (para mantener consistencia)
    await queryRunner.query(`
      UPDATE trials 
      SET status = 'FOLLOW_UP' 
      WHERE status = 'ACTIVE';
    `);

    // Recrear el enum con los nuevos valores
    await queryRunner.query(`
      ALTER TABLE trials 
      ALTER COLUMN status TYPE varchar(50);
    `);

    // Agregar constraint para validar los valores permitidos
    await queryRunner.query(`
      ALTER TABLE trials 
      ADD CONSTRAINT trials_status_check 
      CHECK (status IN ('PREPARATION', 'RECRUITING', 'FOLLOW_UP', 'CLOSED'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir constraint
    await queryRunner.query(`
      ALTER TABLE trials 
      DROP CONSTRAINT IF EXISTS trials_status_check;
    `);

    // Revertir cambios en status (FOLLOW_UP -> ACTIVE)
    await queryRunner.query(`
      UPDATE trials 
      SET status = 'ACTIVE' 
      WHERE status = 'FOLLOW_UP';
    `);

    // Eliminar columnas agregadas
    await queryRunner.dropColumn('trials', 'research_site_name');
    await queryRunner.dropColumn('trials', 'research_site_url');
    await queryRunner.dropColumn('trials', 'recruitment_deadline');

    // Restaurar enum original
    await queryRunner.query(`
      ALTER TABLE trials 
      ALTER COLUMN status TYPE varchar(50);
    `);

    await queryRunner.query(`
      ALTER TABLE trials 
      ADD CONSTRAINT trials_status_check_old 
      CHECK (status IN ('RECRUITING', 'ACTIVE', 'CLOSED'));
    `);
  }
}
