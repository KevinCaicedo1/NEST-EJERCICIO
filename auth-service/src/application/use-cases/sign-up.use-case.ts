import { Inject, Injectable, ConflictException } from '@nestjs/common';
import type {
  ISignUpUseCase,
  SignUpInput,
  SignUpOutput,
} from '../../domain/ports/inbound';
import {
  USER_REPOSITORY,
  PASSWORD_HASHER,
} from '../../domain/ports/outbound';
import type {
  IUserRepository,
  IPasswordHasher,
} from '../../domain/ports/outbound';
import { User } from '../../domain/entities/user.entity';


@Injectable()
export class SignUpUseCase implements ISignUpUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: SignUpInput): Promise<SignUpOutput> {
    // 1. Verificar que el email no esté registrado
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException(
        `El email ${input.email.getValue()} ya está registrado`,
      );
    }

    // 2. Hashear la contraseña
    const hashedPassword = await this.passwordHasher.hash(input.password);

    // 3. Crear la entidad de usuario (lógica de dominio)
    const userToCreate = User.create({
      email: input.email,
      passwordHash: hashedPassword,
      role: input.role,
    });

    // 4. Persistir el usuario
    const savedUser = await this.userRepository.save(userToCreate);

    // 5. Retornar el resultado
    return {
      user: savedUser,
    };
  }
}
