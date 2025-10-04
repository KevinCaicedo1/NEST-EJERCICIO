import { Password } from '../../value-objects';

/**
 * Puerto de salida (outbound) para el hasheador de contraseñas
 * 
 * Principio de Inversión de Dependencias:
 * - Abstracción definida en el dominio
 * - Implementación en infraestructura (puede ser bcrypt, argon2, etc.)
 * 
 * Principio Open/Closed:
 * - Abierto para extensión: puedes cambiar de bcrypt a otro algoritmo
 * - Cerrado para modificación: no necesitas cambiar el dominio
 */
export interface IPasswordHasher {
  /**
   * Hashea una contraseña en texto plano
   * @param plainPassword - Contraseña sin hashear
   * @returns Password hasheada
   */
  hash(plainPassword: Password): Promise<Password>;

  /**
   * Compara una contraseña en texto plano con un hash
   * @param plainPassword - Contraseña a verificar
   * @param hashedPassword - Hash almacenado
   * @returns true si coinciden, false si no
   */
  compare(plainPassword: Password, hashedPassword: Password): Promise<boolean>;
}

/**
 * Token de inyección para DI de NestJS
 */
export const PASSWORD_HASHER = Symbol('IPasswordHasher');
