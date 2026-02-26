import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Trial } from '../../trials/entities/trial.entity';
import { ResearchSite } from '../../research-sites/entities/research-site.entity';

/**
 * Estados del flujo de pacientes:
 * - RECEIVED: Paciente recibido (estado inicial)
 * - VERIFIED: Paciente verificado (datos confirmados)
 * - STUDY_ASSIGNED: Paciente asignado a un estudio clínico
 * - AWAITING_STUDY: En espera de asignación a estudio
 * - PENDING_CONTACT: Pendiente de contacto
 * - DISCARDED: Descartado o eliminado (soft delete)
 */
export enum PatientIntakeStatus {
  RECEIVED = 'RECEIVED',
  VERIFIED = 'VERIFIED',
  STUDY_ASSIGNED = 'STUDY_ASSIGNED',
  AWAITING_STUDY = 'AWAITING_STUDY',
  PENDING_CONTACT = 'PENDING_CONTACT',
  DISCARDED = 'DISCARDED',
}

/**
 * Origen de la postulación del paciente:
 * - WEB_FORM: Creado a través del formulario público web
 * - MANUAL_ENTRY: Creado manualmente por un administrador en el dashboard
 * - REFERRAL: Referido por un médico u otra fuente
 * - OTHER: Otro origen no especificado
 */
export enum PatientIntakeSource {
  WEB_FORM = 'WEB_FORM',
  MANUAL_ENTRY = 'MANUAL_ENTRY',
  REFERRAL = 'REFERRAL',
  OTHER = 'OTHER',
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

  /**
   * Código CIE-10 de la condición principal
   * Ejemplo: "E11.9" para Diabetes mellitus tipo 2
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  condicionPrincipalCodigo: string | null;

  /**
   * Patologías prevalentes seleccionadas (checkboxes)
   * Array de strings con las patologías comunes
   */
  @Column({ type: 'jsonb', nullable: true })
  patologias: string[] | null;

  @Column({ type: 'text', nullable: true })
  descripcionCondicion: string | null;

  @Column({ type: 'text', nullable: true })
  medicamentosActuales: string | null;

  /**
   * Alergias en texto libre (legacy, mantener por compatibilidad)
   */
  @Column({ type: 'text', nullable: true })
  alergias: string | null;

  /**
   * Alergias estructuradas con código CIE-10 y nombre
   * Array de objetos: [{codigo: "T78.4", nombre: "Alergia no especificada"}, ...]
   * Usado para matching preciso con ensayos clínicos
   */
  @Column({ type: 'jsonb', nullable: true })
  alergiasEstructuradas: Array<{ codigo: string; nombre: string }> | null;

  @Column({ type: 'text', nullable: true })
  cirugiasPrevias: string | null;


  /**
   * Códigos CIE-10 de las enfermedades del paciente
   * Array de códigos (ej: ["E11.9", "I10", "E78.5"])
   * Estos códigos se usan para matching preciso con ensayos clínicos
   */
  @Column({ type: 'jsonb', nullable: true })
  codigos_cie10: string[] | null;

  /**
   * Otras enfermedades en texto libre (legacy, mantener por compatibilidad)
   */
  @Column({ type: 'text', nullable: true })
  otrasEnfermedades: string | null;

  /**
   * Otras enfermedades estructuradas con código CIE-10 y nombre
   * Array de objetos: [{codigo: "I10", nombre: "Hipertensión arterial"}, ...]
   * Usado para matching preciso con ensayos clínicos
   */
  @Column({ type: 'jsonb', nullable: true })
  otrasEnfermedadesEstructuradas: Array<{ codigo: string; nombre: string }> | null;

  /**
   * Medicamentos actuales estructurados (híbrido: autocomplete + texto libre)
   * Array de strings: ["Metformina", "Enalapril", "Atorvastatina"]
   * Solo nombres de medicamentos, sin dosis ni frecuencia
   */
  @Column({ type: 'jsonb', nullable: true })
  medicamentosEstructurados: string[] | null;

  /**
   * URL del documento de consentimiento informado firmado (escaneado/foto)
   * Se sube desde el dashboard admin cuando el paciente firma presencialmente
   * Almacenado en S3
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  consentDocumentUrl: string | null;

  @Column({ default: false })
  aceptaTerminos: boolean;

  @Column({ default: false })
  aceptaPrivacidad: boolean;

  /**
   * Consentimiento para almacenamiento de datos por 15 años
   * Requerido por normativa de estudios clínicos
   */
  @Column({ default: false })
  aceptaAlmacenamiento15Anos: boolean;

  @Column({
    type: 'enum',
    enum: PatientIntakeStatus,
    default: PatientIntakeStatus.RECEIVED,
  })
  status: PatientIntakeStatus;

  /**
   * Origen de la postulación: WEB_FORM (formulario público) o MANUAL_ENTRY (dashboard admin)
   * Por defecto es WEB_FORM para mantener compatibilidad con registros existentes
   */
  @Column({
    type: 'enum',
    enum: PatientIntakeSource,
    default: PatientIntakeSource.WEB_FORM,
  })
  source: PatientIntakeSource;

  @Column({ type: 'uuid', nullable: true })
  trialId: string | null;

  @ManyToOne(() => Trial, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'trialId' })
  trial: Trial | null;

  /**
   * Sitio/Institución de referencia (opcional)
   * Indica qué sitio o institución derivó o refirió al paciente
   * Ejemplo: Clínica Alemana, Hospital Regional, Clínica Vanguardia, etc.
   */
  @Column({ type: 'uuid', nullable: true })
  referralResearchSiteId: string | null;

  @ManyToOne(() => ResearchSite, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'referralResearchSiteId' })
  referralResearchSite: ResearchSite | null;

  @CreateDateColumn()
  createdAt: Date;
}
