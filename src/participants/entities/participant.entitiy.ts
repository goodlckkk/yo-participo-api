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
  
  export enum ParticipantStatus {
    CANDIDATE = 'CANDIDATE',
    CONTACTED = 'CONTACTED',
    PARTICIPATING = 'PARTICIPATING',
    REJECTED = 'REJECTED',
  }
  
  @Entity('participants')
  export class Participant {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({
      type: 'enum',
      enum: ParticipantStatus,
      default: ParticipantStatus.CANDIDATE,
    })
    status: ParticipantStatus;
  
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