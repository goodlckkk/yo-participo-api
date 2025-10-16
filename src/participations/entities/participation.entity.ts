import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Trial } from '../../trials/entities/trial.entity';
import { User } from '../../users/entities/user.entity';

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

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @ManyToOne(() => Trial, { nullable: false })
  @JoinColumn({ name: 'trial_id' })
  trial: Trial;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
