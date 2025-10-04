import { Email, Password, Role, UserId } from '../value-objects';

/**
 * User Entity - Entidad del dominio
 * Representa un usuario en el sistema de autenticación
 * 
 * Principios aplicados:
 * - Single Responsibility: solo maneja lógica relacionada con el usuario
 * - Encapsulamiento: estado inmutable, solo accesible via getters
 * - Value Objects: utiliza VOs para propiedades complejas
 */
export class User {
  private readonly id: UserId;
  private readonly email: Email;
  private readonly passwordHash: Password;
  private readonly role: Role;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  private constructor(props: {
    id: UserId;
    email: Email;
    passwordHash: Password;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Factory method para crear un nuevo usuario (signup)
   * El ID será generado por la base de datos
   */
  static create(props: {
    email: Email;
    passwordHash: Password;
    role?: Role;
  }): Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
    const now = new Date();
    return {
      email: props.email,
      passwordHash: props.passwordHash,
      role: props.role || Role.USER,
      getId: () => {
        throw new Error('El ID aún no ha sido asignado');
      },
      getEmail: () => props.email,
      getPasswordHash: () => props.passwordHash,
      getRole: () => props.role || Role.USER,
      getCreatedAt: () => now,
      getUpdatedAt: () => now,
    } as any;
  }

  /**
   * Factory method para reconstituir un usuario desde la base de datos
   */
  static reconstitute(props: {
    id: UserId;
    email: Email;
    passwordHash: Password;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(props);
  }

  // Getters - exposición controlada del estado interno
  getId(): UserId {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getPasswordHash(): Password {
    return this.passwordHash;
  }

  getRole(): Role {
    return this.role;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * Método de dominio: verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }

  /**
   * Convierte la entidad a un objeto plano (útil para respuestas públicas)
   * No expone el password hash
   */
  toPublic(): {
    id: string;
    email: string;
    role: Role;
  } {
    return {
      id: this.id.getValue(),
      email: this.email.getValue(),
      role: this.role,
    };
  }
}
