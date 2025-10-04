import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IUserRepository } from '../../../../domain/ports/outbound';
import { User } from '../../../../domain/entities/user.entity';
import {
  Email,
  Password,
  UserId,
  Role,
  isValidRole,
} from '../../../../domain/value-objects';
import { UserEntity } from './entities/user.entity.typeorm';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: Email): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { email: email.getValue() },
    });

    if (!userEntity) {
      return null;
    }

    return this.mapEntityToDomain(userEntity);
  }

  async findById(id: UserId): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id: id.getValue() },
    });

    if (!userEntity) {
      return null;
    }

    return this.mapEntityToDomain(userEntity);
  }

  async save(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    // Crear entidad TypeORM desde el dominio
    const userEntity = this.userRepository.create({
      email: user.getEmail().getValue(),
      passwordHash: user.getPasswordHash().getValue(),
      role: user.getRole(),
    });

    // Persistir en la base de datos
    const savedEntity = await this.userRepository.save(userEntity);

    // Retornar entidad de dominio
    return this.mapEntityToDomain(savedEntity);
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { email: email.getValue() },
    });
    return count > 0;
  }

  private mapEntityToDomain(entity: UserEntity): User {
    // Validación y conversión de tipos primitivos a Value Objects
    const userId = UserId.create(entity.id);
    const email = Email.create(entity.email);
    const passwordHash = Password.fromHash(entity.passwordHash);

    // Validación del role
    if (!isValidRole(entity.role)) {
      throw new Error(`Role inválido en la base de datos: ${entity.role}`);
    }

    return User.reconstitute({
      id: userId,
      email: email,
      passwordHash: passwordHash,
      role: entity.role as Role,
      createdAt: new Date(entity.createdAt),
      updatedAt: new Date(entity.updatedAt),
    });
  }
}
