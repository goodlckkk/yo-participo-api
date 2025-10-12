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
  
  export enum TrialStatus {
    RECRUITING = 'RECRUITING',
    ACTIVE = 'ACTIVE',
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
  
    @ManyToOne(() => Sponsor, { nullable: false })
    @JoinColumn({ name: 'sponsor_id' })
    sponsor: Sponsor;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }
  
