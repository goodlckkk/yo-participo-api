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
  import { ResearchSite } from '../../research-sites/entities/research-site.entity';
  import { InclusionCriteria } from '../interfaces/inclusion-criteria.interface';
  
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
  
    @Column({ type: 'varchar', length: 255 })
    title: string;
  
    @Column({ type: 'text' })
    public_description: string;
  
    /**
     * Criterios de inclusión/exclusión del ensayo
     * Ahora incluye soporte para códigos CIE-10 estandarizados
     */
    @Column({ type: 'jsonb', nullable: true })
    inclusion_criteria: InclusionCriteria | null;
  
    @Column({
      type: 'enum',
      enum: TrialStatus,
      default: TrialStatus.RECRUITING,
    })
    status: TrialStatus;
  
    @Column({ type: 'varchar', length: 255 })
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
    @Column({ type: 'varchar', length: 500, nullable: true })
    research_site_url: string;

    /**
     * Nombre del sitio/centro de investigación
     */
    @Column({ type: 'varchar', length: 255, nullable: true })
    research_site_name: string;

    @ManyToOne(() => Sponsor, { nullable: false })
    @JoinColumn({ name: 'sponsor_id' })
    sponsor: Sponsor;

    /**
     * Relación con la institución/sitio de investigación
     * Un ensayo pertenece a una institución
     */
    @ManyToOne(() => ResearchSite, (researchSite) => researchSite.trials, { nullable: true })
    @JoinColumn({ name: 'research_site_id' })
    researchSite: ResearchSite | null;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }
