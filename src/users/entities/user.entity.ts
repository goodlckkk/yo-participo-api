import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ResearchSite } from '../../research-sites/entities/research-site.entity';

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
  INSTITUTION = 'INSTITUTION',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', unique: true, length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  birth_date: Date;

  @Column({ type: 'uuid', nullable: true })
  institutionId: string | null;

  @ManyToOne(() => ResearchSite, { nullable: true })
  @JoinColumn({ name: 'institutionId' })
  institution: ResearchSite | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}