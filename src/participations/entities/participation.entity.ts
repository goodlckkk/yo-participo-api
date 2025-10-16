import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from '../../users/entities/user.entity';
  import { Trial } from '../../trials/entities/trial.entity';
  
  export enum ParticipationStatus {
    CANDIDATE = 'CANDIDATE',
    CONTACTED = 'CONTACTED',
    PARTICIPATING = 'PARTICIPATING',
    REJECTED = 'REJECTED',
  }
  
  @Entity('participations')
  export class Participation {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({
      type: 'enum',
      enum: ParticipationStatus,
      default: ParticipationStatus.CANDIDATE,
    })
    status: ParticipationStatus;
  
    @CreateDateColumn({ name: 'assigned_at' })
    assignedAt: Date;
  
    // --- Relationship with User (Patient) ---
    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'patient_id' })
    patient: User;
  
    // --- Relationship with ClinicalTrial ---
    @ManyToOne(() => Trial, { nullable: false })
    @JoinColumn({ name: 'trial_id' })
    trial: Trial;
  }