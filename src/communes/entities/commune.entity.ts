import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Entidad que representa una Comuna de Chile
 *
 * Esta entidad almacena las 346 comunas oficiales de Chile con su región correspondiente.
 * Se separa de research_sites para mantener un catálogo limpio de ubicaciones geográficas.
 */
@Entity('communes')
export class Commune {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  region: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  codigo_region: string | null;

  @Column({ type: 'boolean', default: true })
  activa: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor(partial?: Partial<Commune>) {
    Object.assign(this, partial);
  }
}
