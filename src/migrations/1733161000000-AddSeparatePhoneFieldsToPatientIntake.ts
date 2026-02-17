import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para separar el teléfono en código de país + número
 *
 * CAMBIOS:
 * 1. Hacer telefono nullable (mantener por compatibilidad)
 * 2. Agregar telefonoCodigoPais (varchar 5)
 * 3. Agregar telefonoNumero (varchar 20)
 * 4. Migrar datos existentes: extraer código país del telefono actual
 *
 * Fecha: 2025-12-02
 * Relacionado con: Mejora UX del formulario de pacientes
 */
export class AddSeparatePhoneFieldsToPatientIntake1733161000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar nuevas columnas (aumentar tamaño de telefonoCodigoPais para manejar casos edge)
    await queryRunner.query(`
      ALTER TABLE patient_intakes 
      ADD COLUMN "telefonoCodigoPais" varchar(10) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE patient_intakes 
      ADD COLUMN "telefonoNumero" varchar(20) NULL;
    `);

    // 2. Hacer telefono nullable
    await queryRunner.query(`
      ALTER TABLE patient_intakes 
      ALTER COLUMN telefono DROP NOT NULL;
    `);

    // 3. Migrar datos existentes: extraer código país y número
    // Formato actual: "+56 9 1234 5678" o "+56912345678" o "912345678"
    await queryRunner.query(`
      UPDATE patient_intakes 
      SET 
        "telefonoCodigoPais" = CASE 
          WHEN telefono LIKE '+%' AND POSITION(' ' IN telefono) > 0 THEN 
            -- Formato: "+56 912345678" (con espacio)
            SUBSTRING(telefono FROM 1 FOR POSITION(' ' IN telefono) - 1)
          WHEN telefono LIKE '+%' THEN 
            -- Formato: "+56912345678" (sin espacio) - extraer solo +56
            SUBSTRING(telefono FROM 1 FOR 3)
          ELSE 
            -- Sin código de país, asumir Chile
            '+56'
        END,
        "telefonoNumero" = CASE 
          WHEN telefono LIKE '+%' AND POSITION(' ' IN telefono) > 0 THEN 
            -- Formato: "+56 912345678" (con espacio)
            REGEXP_REPLACE(
              SUBSTRING(telefono FROM POSITION(' ' IN telefono) + 1), 
              '[^0-9]', 
              '', 
              'g'
            )
          WHEN telefono LIKE '+%' THEN 
            -- Formato: "+56912345678" (sin espacio) - extraer desde posición 4
            SUBSTRING(telefono FROM 4)
          ELSE 
            -- Sin código de país, usar todo el número
            REGEXP_REPLACE(telefono, '[^0-9]', '', 'g')
        END
      WHERE telefono IS NOT NULL;
    `);

    // 4. Comentarios en las columnas
    await queryRunner.query(`
      COMMENT ON COLUMN patient_intakes.telefono IS 
      'Teléfono completo (legacy, mantener por compatibilidad)';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN patient_intakes."telefonoCodigoPais" IS 
      'Código de país del teléfono (ej: +56, +1, +34)';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN patient_intakes."telefonoNumero" IS 
      'Número de teléfono sin código de país (ej: 912345678)';
    `);

    console.log('✅ Migración: Campos de teléfono separados agregados');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir: reconstruir telefono desde los campos separados
    await queryRunner.query(`
      UPDATE patient_intakes 
      SET telefono = CONCAT("telefonoCodigoPais", ' ', "telefonoNumero")
      WHERE "telefonoCodigoPais" IS NOT NULL 
        AND "telefonoNumero" IS NOT NULL;
    `);

    // Hacer telefono NOT NULL nuevamente
    await queryRunner.query(`
      ALTER TABLE patient_intakes 
      ALTER COLUMN telefono SET NOT NULL;
    `);

    // Eliminar columnas nuevas
    await queryRunner.query(`
      ALTER TABLE patient_intakes 
      DROP COLUMN IF EXISTS "telefonoNumero";
    `);

    await queryRunner.query(`
      ALTER TABLE patient_intakes 
      DROP COLUMN IF EXISTS "telefonoCodigoPais";
    `);

    console.log('⏪ Revertido: Campos de teléfono separados eliminados');
  }
}
