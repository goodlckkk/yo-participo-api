import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Sponsor } from '../../sponsors/entities/sponsor.entity';
  
  /**
   * Estados de un estudio clínico según feedback:
   * - PREPARATION: En preparación (planificación)
   * - RECRUITING: Reclutamiento activo (buscando participantes)
   * - FOLLOW_UP: En seguimiento (estudio en curso con pacientes)
   * - CLOSED: Cerrado (estudio finalizado)
   */
  export enum TrialStatus {
    PREPARATION = 'PREPARATION',
    RECRUITING = 'RECRUITING',
    FOLLOW_UP = 'FOLLOW_UP',
    CLOSED = 'CLOSED',
  }
  
  @Entity('trials')
  export class Trial {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ length: 255 })
    title: string;
  
    @Column({ type: 'text' })
    public_description: string;
  
    @Column({ type: 'jsonb', nullable: true })
    inclusion_criteria: object;
  
    @Column({
      type: 'enum',
      enum: TrialStatus,
      default: TrialStatus.RECRUITING,
    })
    status: TrialStatus;
  
    @Column({ length: 255 })
    clinic_city: string;

    @Column({ type: 'int', nullable: true, default: 30 })
    max_participants: number;

    @Column({ type: 'int', nullable: true, default: 0 })
    current_participants: number;

    /**
     * Fecha límite para el reclutamiento de participantes
     * Después de esta fecha, el estudio no aceptará más postulaciones
     */
    @Column({ type: 'date', nullable: true })
    recruitment_deadline: Date;

    /**
     * URL del sitio web del centro de investigación
     */
    @Column({ length: 500, nullable: true })
    research_site_url: string;

    /**
     * Nombre del sitio/centro de investigación
     */
    @Column({ length: 255, nullable: true })
    research_site_name: string;

    @ManyToOne(() => Sponsor, { nullable: false })
    @JoinColumn({ name: 'sponsor_id' })
    sponsor: Sponsor;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }
