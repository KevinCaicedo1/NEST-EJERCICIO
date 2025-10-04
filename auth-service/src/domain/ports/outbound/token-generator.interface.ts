import { User } from '../../entities/user.entity';

/**
 * Payload que se incluye en el JWT
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
}

/**
 * Puerto de salida (outbound) para generación de tokens JWT
 * 
 * Principio de Inversión de Dependencias:
 * - El dominio define qué necesita, no cómo se hace
 * - La implementación usa @nestjs/jwt internamente
 */
export interface ITokenGenerator {
  /**
   * Genera un JWT para un usuario
   * @param user - Usuario para el cual generar el token
   * @returns Token JWT como string
   */
  generateToken(user: User): Promise<string>;

  /**
   * Verifica y decodifica un JWT
   * @param token - Token a verificar
   * @returns Payload decodificado
   * @throws Si el token es inválido o expiró
   */
  verifyToken(token: string): Promise<JwtPayload>;
}

/**
 * Token de inyección para DI de NestJS
 */
export const TOKEN_GENERATOR = Symbol('ITokenGenerator');
