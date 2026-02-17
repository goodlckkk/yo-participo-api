import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Trial } from '../../trials/entities/trial.entity';

/**
 * Entidad que representa una Institución o Sitio de Investigación
 *
 * Una institución puede tener múltiples ensayos clínicos.
 * Esto permite estandarizar los nombres de instituciones y evitar duplicados.
 *
 * Ejemplos:
 * - Clínica Vanguardia
 * - Hospital Clínico Universidad de Chile
 * - Instituto Nacional del Cáncer
 */
@Entity('research_sites')
export class ResearchSite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  direccion: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ciudad: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  comuna: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  sitio_web: string | null;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  // Relación: Una institución tiene muchos ensayos
  @OneToMany(() => Trial, (trial) => trial.researchSite)
  trials: Trial[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
