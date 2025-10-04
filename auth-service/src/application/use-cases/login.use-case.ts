import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type {
  ILoginUseCase,
  LoginInput,
  LoginOutput,
} from '../../domain/ports/inbound';
import {
  USER_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_GENERATOR,
} from '../../domain/ports/outbound';
import type {
  IUserRepository,
  IPasswordHasher,
  ITokenGenerator,
} from '../../domain/ports/outbound';

/**
 * Caso de Uso: Autenticación de Usuario
 * 
 * Principios SOLID aplicados:
 * - SRP: Solo maneja la lógica de autenticación
 * - OCP: Extensible (puedes agregar 2FA, rate limiting, etc.)
 * - LSP: Implementa ILoginUseCase correctamente
 * - ISP: Depende solo de las interfaces necesarias
 * - DIP: Depende de abstracciones, no de implementaciones
 * 
 * Patrón: Use Case (Clean Architecture)
 */
@Injectable()
export class LoginUseCase implements ILoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: ITokenGenerator,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      // No revelamos si el usuario existe o no por seguridad
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar contraseña
    const isPasswordValid = await this.passwordHasher.compare(
      input.password,
      user.getPasswordHash(),
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Generar token JWT
    const accessToken = await this.tokenGenerator.generateToken(user);

    // 4. Retornar token
    return {
      accessToken,
    };
  }
}
