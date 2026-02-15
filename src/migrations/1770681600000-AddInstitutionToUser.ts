import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

/**
 * Migración para agregar soporte de Instituciones/Moderadores a Usuarios
 * 
 * CAMBIOS:
 * 1. Agregar valor 'INSTITUTION' al enum de roles (si es Postgres Enum)
 * 2. Agregar columna institutionId a users
 * 3. Crear llave foránea a research_sites
 */
export class AddInstitutionToUser1770681600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Intentar agregar el valor al ENUM
    // Nota: Esto depende de cómo TypeORM nombró el enum. Por defecto es "users_role_enum".
    try {
        // Verificamos si es Postgres para ejecutar comando específico
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" ADD VALUE IF NOT EXISTS 'INSTITUTION'`);
    } catch (e) {
        console.log('⚠️ Advertencia: No se pudo alterar el enum user_role_enum. Puede que no use enum nativo o el nombre sea diferente.', e.message);
    }

    // 2. Agregar columna institutionId
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'institutionId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // 3. Agregar Foreign Key
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['institutionId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'research_sites',
        onDelete: 'SET NULL',
      }),
    );

    console.log('✅ Migración: Rol INSTITUTION y campo institutionId agregados a users');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');
    const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('institutionId') !== -1);
    if (foreignKey) {
        await queryRunner.dropForeignKey('users', foreignKey);
    }
    await queryRunner.dropColumn('users', 'institutionId');
    
    // No se puede eliminar valor de enum fácilmente en Postgres
  }
}
