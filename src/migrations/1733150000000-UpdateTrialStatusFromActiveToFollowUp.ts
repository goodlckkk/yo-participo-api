import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para actualizar estados antiguos de trials
 *
 * PROBLEMA:
 * - El código anterior usaba el estado "ACTIVE"
 * - El nuevo código usa "FOLLOW_UP" en su lugar
 * - Hay registros en BD con "ACTIVE" que causan error
 *
 * SOLUCIÓN:
 * - Actualizar todos los registros "ACTIVE" → "FOLLOW_UP"
 * - Esta migración DEBE ejecutarse ANTES de las otras
 */
export class UpdateTrialStatusFromActiveToFollowUp1733150000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // IMPORTANTE: PostgreSQL requiere que los nuevos valores de ENUM
    // se agreguen FUERA de una transacción

    // Liberar la transacción actual
    await queryRunner.commitTransaction();

    // Agregar el valor FOLLOW_UP al enum (fuera de transacción)
    await queryRunner.query(`
      ALTER TYPE trials_status_enum ADD VALUE IF NOT EXISTS 'FOLLOW_UP';
    `);

    console.log('✅ Valor FOLLOW_UP agregado al enum');

    // Iniciar nueva transacción para el UPDATE
    await queryRunner.startTransaction();

    // Actualizar todos los ensayos con estado ACTIVE a FOLLOW_UP
    await queryRunner.query(`
      UPDATE trials 
      SET status = 'FOLLOW_UP' 
      WHERE status = 'ACTIVE'
    `);

    console.log('✅ Migración: Estados ACTIVE actualizados a FOLLOW_UP');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir: FOLLOW_UP → ACTIVE
    await queryRunner.query(`
      UPDATE trials 
      SET status = 'ACTIVE' 
      WHERE status = 'FOLLOW_UP'
    `);

    console.log('⏪ Revertido: Estados FOLLOW_UP revertidos a ACTIVE');
  }
}
