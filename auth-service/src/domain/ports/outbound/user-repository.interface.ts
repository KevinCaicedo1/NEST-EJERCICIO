import { Email, UserId } from '../../value-objects';
import { User } from '../../entities/user.entity';

/**
 * Puerto de salida (outbound) para el repositorio de usuarios
 * 
 * Principio de Inversión de Dependencias (DIP):
 * - El dominio define el contrato (interfaz)
 * - La infraestructura lo implementa
 * - No hay dependencia del dominio hacia la infraestructura
 * 
 * Principio de Segregación de Interfaces (ISP):
 * - Interfaz cohesiva con métodos específicos
 */
export interface IUserRepository {
  /**
   * Busca un usuario por su email
   * @returns User si existe, null si no
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Busca un usuario por su ID
   * @returns User si existe, null si no
   */
  findById(id: UserId): Promise<User | null>;

  /**
   * Persiste un nuevo usuario en el sistema
   * @returns User con el ID asignado
   */
  save(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;

  /**
   * Verifica si existe un usuario con el email dado
   * @returns true si existe, false si no
   */
  existsByEmail(email: Email): Promise<boolean>;
}

/**
 * Token de inyección para DI de NestJS
 * Permite inyectar la implementación sin acoplamiento
 */
export const USER_REPOSITORY = Symbol('IUserRepository');
