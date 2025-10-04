import { Email, Password, Role } from '../../value-objects';
import { User } from '../../entities/user.entity';

/**
 * Input DTO para el caso de uso SignUp
 */
export interface SignUpInput {
  email: Email;
  password: Password;
  role?: Role;
}

/**
 * Output DTO para el caso de uso SignUp
 */
export interface SignUpOutput {
  user: User;
}

/**
 * Puerto de entrada (inbound) para el caso de uso de registro
 * 
 * Principio de Inversión de Dependencias:
 * - Define el contrato que debe cumplir el caso de uso
 * - El controller depende de esta abstracción, no de la implementación
 */
export interface ISignUpUseCase {
  /**
   * Ejecuta el caso de uso de registro de usuario
   * @throws Error si el email ya está registrado
   * @throws Error si los datos son inválidos
   */
  execute(input: SignUpInput): Promise<SignUpOutput>;
}

/**
 * Token de inyección para DI de NestJS
 */
export const SIGN_UP_USE_CASE = Symbol('ISignUpUseCase');
