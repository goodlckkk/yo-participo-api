import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migración: Cambiar imageUrl de hero_slides a tipo TEXT
 * 
 * Esta migración cambia el tipo de la columna imageUrl de VARCHAR(500) a TEXT
 * para permitir almacenar imágenes en formato base64, que son mucho más largas.
 * 
 * Razón: Las imágenes base64 pueden tener miles de caracteres, superando
 * el límite de 500 caracteres de VARCHAR.
 */
export class ChangeHeroSlideImageUrlToText1733329000000 implements MigrationInterface {
    name = 'ChangeHeroSlideImageUrlToText1733329000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Cambiar el tipo de columna de VARCHAR(500) a TEXT
        await queryRunner.query(`
            ALTER TABLE "hero_slides" 
            ALTER COLUMN "imageUrl" TYPE TEXT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir el cambio: volver a VARCHAR(500)
        // NOTA: Esto podría truncar datos si hay imágenes base64 guardadas
        await queryRunner.query(`
            ALTER TABLE "hero_slides" 
            ALTER COLUMN "imageUrl" TYPE VARCHAR(500)
        `);
    }
}
