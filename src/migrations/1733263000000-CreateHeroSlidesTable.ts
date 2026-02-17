import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migración: Crear tabla hero_slides
 *
 * Esta tabla almacena las imágenes del slider principal (hero) de la página de inicio.
 * Permite gestionar múltiples slides con título, descripción, imagen, orden y estado.
 *
 * Características:
 * - UUID como primary key
 * - URL de imagen (obligatorio)
 * - Título y descripción (opcionales)
 * - Botón CTA con texto y URL (opcionales)
 * - Orden para controlar la secuencia
 * - Estado activo/inactivo
 * - Timestamps automáticos
 */
export class CreateHeroSlidesTable1733263000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'hero_slides',
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
            comment: 'URL de la imagen del slide',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
            isNullable: true,
            comment: 'Título del slide (opcional)',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Descripción o subtítulo del slide (opcional)',
          },
          {
            name: 'ctaText',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Texto del botón CTA (opcional)',
          },
          {
            name: 'ctaUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'URL del botón CTA (opcional)',
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
            comment: 'Estado del slide (solo activos se muestran)',
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
      `CREATE INDEX "IDX_hero_slides_order" ON "hero_slides" ("order")`,
    );

    // Crear índice en el campo isActive para optimizar consultas de slides activos
    await queryRunner.query(
      `CREATE INDEX "IDX_hero_slides_isActive" ON "hero_slides" ("isActive")`,
    );

    console.log('✅ Tabla hero_slides creada con índices');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX "IDX_hero_slides_isActive"`);
    await queryRunner.query(`DROP INDEX "IDX_hero_slides_order"`);

    // Eliminar tabla
    await queryRunner.dropTable('hero_slides');

    console.log('✅ Tabla hero_slides eliminada');
  }
}
