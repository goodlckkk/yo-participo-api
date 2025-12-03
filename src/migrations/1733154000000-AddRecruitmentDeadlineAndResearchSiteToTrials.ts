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
export class AddRecruitmentDeadlineAndResearchSiteToTrials1733154000000
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

    // 4. Actualizar el ENUM TYPE de PostgreSQL para incluir los nuevos estados
    // IMPORTANTE: PostgreSQL no permite modificar ENUMs directamente,
    // hay que crear uno nuevo y migrar los datos
    
    // Paso 1: Agregar los nuevos valores al enum existente
    await queryRunner.query(`
      ALTER TYPE trials_status_enum ADD VALUE IF NOT EXISTS 'PREPARATION';
    `);
    
    await queryRunner.query(`
      ALTER TYPE trials_status_enum ADD VALUE IF NOT EXISTS 'FOLLOW_UP';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // NOTA: PostgreSQL no permite eliminar valores de un ENUM TYPE si están en uso
    // Por lo tanto, solo revertimos las columnas agregadas
    
    // Eliminar columnas agregadas
    await queryRunner.dropColumn('trials', 'research_site_name');
    await queryRunner.dropColumn('trials', 'research_site_url');
    await queryRunner.dropColumn('trials', 'recruitment_deadline');
    
    // Para revertir completamente el enum, habría que:
    // 1. Cambiar todos los valores FOLLOW_UP y PREPARATION a otros estados
    // 2. Recrear el enum sin esos valores
    // Esto es destructivo, así que lo dejamos como está
    console.log('⚠️  ADVERTENCIA: Los valores PREPARATION y FOLLOW_UP permanecen en el enum');
  }
}
