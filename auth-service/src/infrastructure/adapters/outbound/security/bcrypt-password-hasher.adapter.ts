import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IPasswordHasher } from '../../../../domain/ports/outbound';
import { Password } from '../../../../domain/value-objects';

/**
 * Adaptador que implementa IPasswordHasher usando bcrypt
 * 
 * Principios aplicados:
 * - SRP: Solo se encarga de hashear contraseñas con bcrypt
 * - DIP: Implementa la interfaz definida en el dominio
 * - OCP: Si necesitas cambiar a argon2, creas otro adaptador sin modificar este
 * 
 * Patrón: Adapter (Hexagonal Architecture)
 */
@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds = 10;

  async hash(plainPassword: Password): Promise<Password> {
    const hashedValue = await bcrypt.hash(
      plainPassword.getValue(),
      this.saltRounds,
    );
    return Password.fromHash(hashedValue);
  }

  async compare(
    plainPassword: Password,
    hashedPassword: Password,
  ): Promise<boolean> {
    return bcrypt.compare(
      plainPassword.getValue(),
      hashedPassword.getValue(),
    );
  }
}
