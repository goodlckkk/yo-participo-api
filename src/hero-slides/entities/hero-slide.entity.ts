import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entidad HeroSlide
 * 
 * Representa las imágenes del slider principal (hero) de la página de inicio.
 * Permite gestionar múltiples slides con título, descripción, imagen y orden.
 * 
 * Características:
 * - Imagen URL (puede ser local o externa)
 * - Título y descripción opcionales
 * - Orden para controlar la secuencia
 * - Estado activo/inactivo
 */
@Entity('hero_slides')
export class HeroSlide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * URL de la imagen del slide
   * Puede ser una URL completa, una ruta relativa o una imagen en base64
   */
  @Column({ type: 'text' })
  imageUrl: string;

  /**
   * Título del slide (opcional)
   * Se muestra sobre la imagen
   */
  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string | null;

  /**
   * Descripción o subtítulo del slide (opcional)
   * Se muestra debajo del título
   */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  /**
   * Texto del botón CTA (Call To Action) - opcional
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  ctaText: string | null;

  /**
   * URL del botón CTA - opcional
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  ctaUrl: string | null;

  /**
   * Orden de visualización
   * Los slides se muestran en orden ascendente
   */
  @Column({ type: 'int', default: 0 })
  order: number;

  /**
   * Estado del slide
   * Solo los slides activos se muestran en el home
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
