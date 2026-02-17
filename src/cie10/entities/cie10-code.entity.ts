import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entidad que representa un código CIE-10
 * (Clasificación Internacional de Enfermedades, 10ª revisión)
 *
 * La CIE-10 es un sistema de clasificación de enfermedades publicado por la OMS.
 * Contiene aproximadamente 14,000 códigos únicos organizados jerárquicamente.
 *
 * Estructura de códigos:
 * - Capítulos: A00-B99, C00-D48, E00-E90, etc.
 * - Categorías: E10, E11, E12 (dentro de E00-E90)
 * - Subcategorías: E11.0, E11.1, E11.9 (dentro de E11)
 *
 * Ejemplo:
 * - Código: E11.9
 * - Descripción: "Diabetes mellitus tipo 2 sin mención de complicación"
 * - Capítulo: "Enfermedades endocrinas, nutricionales y metabólicas"
 * - Nivel: 2 (subcategoría)
 */
@Entity('cie10_codes')
@Index(['codigo'], { unique: true })
@Index(['descripcion'])
export class Cie10Code {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Código CIE-10 (ej: "E11.9", "I10", "C50")
   * Único en la base de datos
   */
  @Column({ type: 'varchar', length: 10, unique: true })
  codigo: string;

  /**
   * Descripción completa de la enfermedad/condición
   * Ej: "Diabetes mellitus tipo 2 sin mención de complicación"
   */
  @Column({ type: 'text' })
  descripcion: string;

  /**
   * Código del padre en la jerarquía (opcional)
   * Ej: Para "E11.9", el padre sería "E11"
   */
  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo_padre: string | null;

  /**
   * Nivel jerárquico:
   * - 0: Capítulo (ej: "E00-E90")
   * - 1: Categoría (ej: "E11")
   * - 2: Subcategoría (ej: "E11.9")
   * - 3: Subcategoría detallada (ej: "E11.21")
   */
  @Column({ type: 'int', default: 0 })
  nivel: number;

  /**
   * Nombre del capítulo al que pertenece
   * Ej: "Enfermedades endocrinas, nutricionales y metabólicas"
   */
  @Column({ type: 'text', nullable: true })
  capitulo: string | null;

  /**
   * Rango del capítulo (ej: "E00-E90")
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  rango_capitulo: string | null;

  /**
   * Indica si el código está activo/vigente
   * Algunos códigos pueden quedar obsoletos en actualizaciones
   */
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  /**
   * Términos de búsqueda adicionales (sinónimos, términos comunes)
   * Almacenado como array JSON para búsquedas más flexibles
   * Ej: ["diabetes", "azúcar en sangre", "glucosa alta"]
   */
  @Column({ type: 'jsonb', nullable: true })
  terminos_busqueda: string[] | null;

  @CreateDateColumn()
  created_at: Date;
}
