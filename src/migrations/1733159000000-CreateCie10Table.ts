import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migración para crear tabla de códigos CIE-10
 * (Clasificación Internacional de Enfermedades, 10ª revisión)
 *
 * CAMBIOS:
 * 1. Crear tabla cie10_codes con estructura completa
 * 2. Crear índices para optimizar búsquedas
 * 3. La tabla estará vacía inicialmente
 * 4. Se poblará con un script separado que importa el CSV
 *
 * Fecha: 2025-12-02
 * Relacionado con: Sistema de clasificación de enfermedades estandarizado
 */
export class CreateCie10Table1733159000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tabla cie10_codes
    await queryRunner.createTable(
      new Table({
        name: 'cie10_codes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'codigo',
            type: 'varchar',
            length: '10',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'descripcion',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'codigo_padre',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'nivel',
            type: 'int',
            default: 0,
          },
          {
            name: 'capitulo',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'rango_capitulo',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'activo',
            type: 'boolean',
            default: true,
          },
          {
            name: 'terminos_busqueda',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 2. Crear índices para optimizar búsquedas
    await queryRunner.createIndex(
      'cie10_codes',
      new TableIndex({
        name: 'IDX_CIE10_CODIGO',
        columnNames: ['codigo'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'cie10_codes',
      new TableIndex({
        name: 'IDX_CIE10_DESCRIPCION',
        columnNames: ['descripcion'],
      }),
    );

    await queryRunner.createIndex(
      'cie10_codes',
      new TableIndex({
        name: 'IDX_CIE10_ACTIVO',
        columnNames: ['activo'],
      }),
    );

    await queryRunner.createIndex(
      'cie10_codes',
      new TableIndex({
        name: 'IDX_CIE10_NIVEL',
        columnNames: ['nivel'],
      }),
    );

    await queryRunner.createIndex(
      'cie10_codes',
      new TableIndex({
        name: 'IDX_CIE10_RANGO_CAPITULO',
        columnNames: ['rango_capitulo'],
      }),
    );

    console.log('✅ Migración: Tabla cie10_codes creada con índices');
    console.log(
      'ℹ️  Nota: La tabla está vacía. Ejecutar script de importación para poblarla.',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.dropIndex('cie10_codes', 'IDX_CIE10_RANGO_CAPITULO');
    await queryRunner.dropIndex('cie10_codes', 'IDX_CIE10_NIVEL');
    await queryRunner.dropIndex('cie10_codes', 'IDX_CIE10_ACTIVO');
    await queryRunner.dropIndex('cie10_codes', 'IDX_CIE10_DESCRIPCION');
    await queryRunner.dropIndex('cie10_codes', 'IDX_CIE10_CODIGO');

    // Eliminar tabla
    await queryRunner.dropTable('cie10_codes');

    console.log('⏪ Revertido: Tabla cie10_codes eliminada');
  }
}
