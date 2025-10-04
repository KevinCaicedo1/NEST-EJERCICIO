import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ITokenGenerator, JwtPayload } from '../../../../domain/ports/outbound';
import { User } from '../../../../domain/entities/user.entity';

/**
 * Adaptador que implementa ITokenGenerator usando @nestjs/jwt
 * 
 * Principios aplicados:
 * - SRP: Solo maneja la generación y verificación de JWT
 * - DIP: Implementa la interfaz del dominio
 * - OCP: Puedes cambiar a otro mecanismo de tokens sin afectar el dominio
 * 
 * Patrón: Adapter (Hexagonal Architecture)
 */
@Injectable()
export class JwtTokenGenerator implements ITokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.getId().getValue(),
      email: user.getEmail().getValue(),
      role: user.getRole(),
    };

    return this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token);
  }
}
