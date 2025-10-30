import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Trial } from '../../trials/entities/trial.entity';

export enum PatientIntakeStatus {
  RECEIVED = 'RECEIVED',
  REVIEWING = 'REVIEWING',
  CONTACTED = 'CONTACTED',
  DISCARDED = 'DISCARDED',
}

@Entity('patient_intakes')
export class PatientIntake {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nombres: string;

  @Column({ length: 255 })
  apellidos: string;

  @Column({ length: 20 })
  rut: string;

  @Column({ type: 'date' })
  fechaNacimiento: string;

  @Column({ length: 20 })
  sexo: string;

  @Column({ length: 30 })
  telefono: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 100 })
  region: string;

  @Column({ length: 100 })
  comuna: string;

  @Column({ length: 255, nullable: true })
  direccion: string | null;

  @Column({ length: 255 })
  condicionPrincipal: string;

  @Column({ type: 'text' })
  descripcionCondicion: string;

  @Column({ type: 'text', nullable: true })
  medicamentosActuales: string | null;

  @Column({ type: 'text', nullable: true })
  alergias: string | null;

  @Column({ type: 'text', nullable: true })
  cirugiasPrevias: string | null;

  @Column({ default: false })
  aceptaTerminos: boolean;

  @Column({ default: false })
  aceptaPrivacidad: boolean;

  @Column({
    type: 'enum',
    enum: PatientIntakeStatus,
    default: PatientIntakeStatus.RECEIVED,
  })
  status: PatientIntakeStatus;

  @ManyToOne(() => Trial, { nullable: true })
  trial: Trial | null;

  @CreateDateColumn()
  createdAt: Date;
}
