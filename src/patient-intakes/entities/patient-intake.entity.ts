import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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

/**
 * Origen de la postulación del paciente:
 * - WEB: Creado a través del formulario público web
 * - MANUAL: Creado manualmente por un administrador en el dashboard
 * - REFERRAL: Referido por un médico u otra fuente (futuro)
 */
export enum PatientIntakeSource {
  WEB = 'WEB',
  MANUAL = 'MANUAL',
  REFERRAL = 'REFERRAL',
}

@Entity('patient_intakes')
export class PatientIntake {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombres: string;

  @Column({ type: 'varchar', length: 255 })
  apellidos: string;

  @Column({ type: 'varchar', length: 20 })
  rut: string;

  @Column({ type: 'date' })
  fechaNacimiento: string;

  @Column({ type: 'varchar', length: 20 })
  sexo: string;

  /**
   * Teléfono completo (legacy, mantener por compatibilidad)
   * Formato: "+56 9 1234 5678"
   */
  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono: string | null;

  /**
   * Código de país del teléfono
   * Ejemplos: "+56" (Chile), "+1" (USA), "+34" (España)
   */
  @Column({ type: 'varchar', length: 5, nullable: true })
  telefonoCodigoPais: string | null;

  /**
   * Número de teléfono sin código de país
   * Ejemplo: "912345678"
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefonoNumero: string | null;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  region: string;

  @Column({ type: 'varchar', length: 100 })
  comuna: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion: string | null;

  @Column({ type: 'varchar', length: 255 })
  condicionPrincipal: string;

  @Column({ type: 'text' })
  descripcionCondicion: string;

  @Column({ type: 'text', nullable: true })
  medicamentosActuales: string | null;

  @Column({ type: 'text', nullable: true })
  alergias: string | null;

  @Column({ type: 'text', nullable: true })
  cirugiasPrevias: string | null;

  @Column({ type: 'jsonb', nullable: true })
  patologias: string[];

  /**
   * Códigos CIE-10 de las enfermedades del paciente
   * Array de códigos (ej: ["E11.9", "I10", "E78.5"])
   * Estos códigos se usan para matching preciso con ensayos clínicos
   */
  @Column({ type: 'jsonb', nullable: true })
  codigos_cie10: string[] | null;

  /**
   * Otras enfermedades en texto libre
   * Para condiciones que no tienen código CIE-10 asignado
   */
  @Column({ type: 'text', nullable: true })
  otrasEnfermedades: string | null;

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

  /**
   * Origen de la postulación: WEB (formulario público) o MANUAL (dashboard admin)
   * Por defecto es WEB para mantener compatibilidad con registros existentes
   */
  @Column({
    type: 'enum',
    enum: PatientIntakeSource,
    default: PatientIntakeSource.WEB,
  })
  source: PatientIntakeSource;

  @Column({ type: 'uuid', nullable: true })
  trialId: string | null;

  @ManyToOne(() => Trial, { nullable: true })
  @JoinColumn({ name: 'trialId' })
  trial: Trial | null;

  @CreateDateColumn()
  createdAt: Date;
}
