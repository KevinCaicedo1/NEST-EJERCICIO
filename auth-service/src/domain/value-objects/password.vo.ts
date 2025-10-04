/**
 * Password Value Object
 * Encapsula la lógica de validación de contraseñas
 * Inmutable y con reglas de negocio encapsuladas
 */
export class Password {
  private readonly value: string;

  private constructor(password: string) {
    this.value = password;
  }

  /**
   * Factory method para crear una contraseña en texto plano con validación
   */
  static create(plainPassword: string): Password {
    if (!plainPassword) {
      throw new Error('La contraseña no puede estar vacía');
    }

    if (plainPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    if (plainPassword.length > 100) {
      throw new Error('La contraseña excede la longitud máxima permitida');
    }

    return new Password(plainPassword);
  }

  /**
   * Factory method para crear desde un hash (cuando se recupera de BD)
   */
  static fromHash(hashedPassword: string): Password {
    if (!hashedPassword) {
      throw new Error('El hash de la contraseña no puede estar vacío');
    }
    return new Password(hashedPassword);
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}
