import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddReferralResearchSite1733432400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la columna ya existe
    const table = await queryRunner.getTable('patient_intakes');
    const hasColumn = table?.findColumnByName('referralResearchSiteId');

    if (!hasColumn) {
      // Agregar columna referralResearchSiteId
      await queryRunner.addColumn(
        'patient_intakes',
        new TableColumn({
          name: 'referralResearchSiteId',
          type: 'uuid',
          isNullable: true,
        }),
      );

      // Agregar foreign key
      await queryRunner.createForeignKey(
        'patient_intakes',
        new TableForeignKey({
          name: 'fk_patient_intakes_referral_research_site',
          columnNames: ['referralResearchSiteId'],
          referencedTableName: 'research_sites',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );

      console.log('✅ Columna referralResearchSiteId agregada exitosamente');
    } else {
      console.log('⚠️  La columna referralResearchSiteId ya existe');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign key
    const table = await queryRunner.getTable('patient_intakes');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.name === 'fk_patient_intakes_referral_research_site',
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey('patient_intakes', foreignKey);
    }

    // Eliminar columna
    await queryRunner.dropColumn('patient_intakes', 'referralResearchSiteId');

    console.log('✅ Columna referralResearchSiteId eliminada');
  }
}
