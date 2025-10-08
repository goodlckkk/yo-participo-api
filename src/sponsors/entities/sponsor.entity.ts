import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity('sponsors') // El nombre de la tabla en la base de datos
  export class Sponsor {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ length: 255, unique: true })
    name: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ length: 255, nullable: true })
    web_site: string;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }