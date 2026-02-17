import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migración: Crear tabla success_stories
 *
 * Esta tabla almacena historias de éxito de pacientes que participaron en estudios clínicos.
 * Similar al sistema de slides, permite gestionar contenido inspirador dinámico.
 *
 * Características:
 * - UUID como primary key
 * - URL de imagen (obligatorio)
 * - Nombre del paciente (opcional, puede ser anónimo)
 * - Condición médica tratada (opcional)
 * - Historia completa (obligatorio)
 * - Cita destacada (opcional)
 * - Orden para controlar la secuencia
 * - Estado activo/inactivo
 * - Timestamps automáticos
 */
export class CreateSuccessStoriesTable1733264000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'success_stories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'imageUrl',
            type: 'varchar',
            length: '500',
            isNullable: false,
            comment: 'URL de la imagen del paciente/historia',
          },
          {
            name: 'patientName',
            type: 'varchar',
            length: '200',
            isNullable: true,
            comment: 'Nombre del paciente (opcional, puede ser anónimo)',
          },
          {
            name: 'condition',
            type: 'varchar',
            length: '200',
            isNullable: true,
            comment: 'Condición médica tratada',
          },
          {
            name: 'story',
            type: 'text',
            isNullable: false,
            comment: 'Historia completa del paciente',
          },
          {
            name: 'quote',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Cita destacada del paciente',
          },
          {
            name: 'order',
            type: 'int',
            default: 0,
            isNullable: false,
            comment: 'Orden de visualización (ascendente)',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Estado de la historia (solo activas se muestran)',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Crear índice en el campo order para optimizar consultas
    await queryRunner.query(
      `CREATE INDEX "IDX_success_stories_order" ON "success_stories" ("order")`,
    );

    // Crear índice en el campo isActive para optimizar consultas de historias activas
    await queryRunner.query(
      `CREATE INDEX "IDX_success_stories_isActive" ON "success_stories" ("isActive")`,
    );

    console.log('✅ Tabla success_stories creada con índices');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX "IDX_success_stories_isActive"`);
    await queryRunner.query(`DROP INDEX "IDX_success_stories_order"`);

    // Eliminar tabla
    await queryRunner.dropTable('success_stories');

    console.log('✅ Tabla success_stories eliminada');
  }
}
