import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Tipo de patrocinador según feedback:
 * - SPONSOR: Patrocinador directo del estudio
 * - CRO: Contract Research Organization (Organización de Investigación por Contrato)
 */
export enum SponsorType {
  SPONSOR = 'SPONSOR',
  CRO = 'CRO',
}

@Entity('sponsors') // El nombre de la tabla en la base de datos
export class Sponsor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  web_site: string | null;

  /**
   * Tipo de patrocinador: SPONSOR o CRO
   * Por defecto es SPONSOR
   */
  @Column({
    type: 'enum',
    enum: SponsorType,
    default: SponsorType.SPONSOR,
  })
  sponsor_type: SponsorType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
