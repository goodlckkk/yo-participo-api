import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migración para crear tabla de Instituciones/Sitios de Investigación
 * 
 * CAMBIOS:
 * 1. Crear tabla research_sites con todos los campos
 * 2. Agregar columna research_site_id a trials (relación)
 * 3. Crear foreign key entre trials y research_sites
 * 4. Migrar datos existentes de research_site_name a la nueva tabla
 * 
 * Fecha: 2025-12-02
 * Relacionado con: Gestión de Instituciones - Evitar duplicados
 */
export class CreateResearchSitesTable1733158000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tabla research_sites
    await queryRunner.createTable(
      new Table({
        name: 'research_sites',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'direccion',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'ciudad',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'region',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'telefono',
            type: 'varchar',
            length: '30',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'sitio_web',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'descripcion',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'activo',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 2. Agregar columna research_site_id a trials
    await queryRunner.query(`
      ALTER TABLE trials 
      ADD COLUMN research_site_id uuid NULL;
    `);

    // 3. Migrar datos existentes: crear instituciones únicas desde research_site_name
    await queryRunner.query(`
      INSERT INTO research_sites (nombre, activo)
      SELECT DISTINCT research_site_name, true
      FROM trials
      WHERE research_site_name IS NOT NULL 
        AND research_site_name != ''
      ON CONFLICT (nombre) DO NOTHING;
    `);

    // 4. Actualizar trials con el ID de la institución correspondiente
    await queryRunner.query(`
      UPDATE trials t
      SET research_site_id = rs.id
      FROM research_sites rs
      WHERE t.research_site_name = rs.nombre
        AND t.research_site_name IS NOT NULL;
    `);

    // 5. Crear foreign key
    await queryRunner.createForeignKey(
      'trials',
      new TableForeignKey({
        columnNames: ['research_site_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'research_sites',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    console.log('✅ Migración: Tabla research_sites creada y datos migrados');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Eliminar foreign key
    const table = await queryRunner.getTable('trials');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('research_site_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('trials', foreignKey);
    }

    // 2. Eliminar columna research_site_id de trials
    await queryRunner.dropColumn('trials', 'research_site_id');

    // 3. Eliminar tabla research_sites
    await queryRunner.dropTable('research_sites');

    console.log('⏪ Revertido: Tabla research_sites eliminada');
  }
}
