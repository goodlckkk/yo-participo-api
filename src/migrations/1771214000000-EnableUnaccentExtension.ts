import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para activar la extensión unaccent en PostgreSQL
 * 
 * Esta extensión permite búsquedas insensibles a acentos, tildes y diéresis
 * Mejora la experiencia de búsqueda en textos en español
 * 
 * Fecha: 2026-02-16
 * Relacionado con: Mejora de búsqueda en módulo CIE-10
 */
export class EnableUnaccentExtension1771214000000 implements MigrationInterface {
  name = 'EnableUnaccentExtension1771214000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Activar la extensión unaccent para búsquedas insensibles a acentos
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS unaccent');
    
    console.log('✅ Extensión unaccent activada para búsquedas insensibles a acentos');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Desactivar la extensión (opcional, generalmente no se recomienda)
    await queryRunner.query('DROP EXTENSION IF EXISTS unaccent CASCADE');
    
    console.log('⏪ Extensión unaccent desactivada');
  }
}