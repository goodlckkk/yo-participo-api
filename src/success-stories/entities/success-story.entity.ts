import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Entidad SuccessStory - Historias de éxito/testimonios
 *
 * Almacena historias inspiradoras de pacientes que participaron en estudios clínicos.
 * Similar al sistema de slides, permite gestionar contenido dinámico desde el dashboard.
 *
 * Campos:
 * - imageUrl: URL de la foto del paciente/historia (obligatorio)
 * - patientName: Nombre del paciente (opcional, puede ser anónimo)
 * - condition: Condición médica tratada (opcional)
 * - story: Historia completa del paciente (obligatorio)
 * - quote: Cita destacada (opcional)
 * - order: Orden de visualización
 * - isActive: Estado activo/inactivo
 */
@Entity('success_stories')
export class SuccessStory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  imageUrl: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  patientName: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  condition: string | null;

  @Column({ type: 'text', nullable: false })
  story: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  quote: string | null;

  @Column({ type: 'int', default: 0, nullable: false })
  order: number;

  @Column({ type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
