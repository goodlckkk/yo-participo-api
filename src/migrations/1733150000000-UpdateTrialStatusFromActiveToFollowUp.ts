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
