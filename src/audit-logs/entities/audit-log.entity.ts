import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entityName: string;

  @Column()
  entityId: string;

  @Column()
  action: string; // CREATE, UPDATE, DELETE

  @Column({ type: 'jsonb', nullable: true })
  changes: any;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  userEmail: string;

  @CreateDateColumn()
  createdAt: Date;
}
