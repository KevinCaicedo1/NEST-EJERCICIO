import { Email, Password } from '../../value-objects';

/**
 * Input DTO para el caso de uso Login
 */
export interface LoginInput {
  email: Email;
  password: Password;
}

/**
 * Output DTO para el caso de uso Login
 */
export interface LoginOutput {
  accessToken: string;
}

/**
 * Puerto de entrada (inbound) para el caso de uso de autenticación
 * 
 * Principio de Inversión de Dependencias:
 * - Define el contrato que debe cumplir el caso de uso
 * - El controller depende de esta abstracción
 */
export interface ILoginUseCase {
  /**
   * Ejecuta el caso de uso de login
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  execute(input: LoginInput): Promise<LoginOutput>;
}

/**
 * Token de inyección para DI de NestJS
 */
export const LOGIN_USE_CASE = Symbol('ILoginUseCase');
