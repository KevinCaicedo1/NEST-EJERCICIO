import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * UserEntity - Entidad de TypeORM para persistencia
 * 
 * IMPORTANTE: Esta NO es la entidad de dominio.
 * Es un modelo de datos de infraestructura que mapea la tabla users.
 * 
 * Separación de responsabilidades:
 * - Domain Entity (User): Lógica de negocio
 * - TypeORM Entity (UserEntity): Persistencia en base de datos
 * 
 * Principio DIP: La infraestructura conoce el dominio, 
 * pero el dominio NO conoce TypeORM
 */
@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 320, unique: true })
  email!: string;

  @Column({ type: 'text', name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'text', default: 'USER' })
  role!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
