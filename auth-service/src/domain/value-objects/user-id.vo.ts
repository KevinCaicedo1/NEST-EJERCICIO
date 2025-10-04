/**
 * UserId Value Object
 * Representa el identificador único de un usuario
 * Inmutable y con validación de formato UUID
 */
export class UserId {
  private readonly value: string;

  private constructor(id: string) {
    this.value = id;
  }

  /**
   * Factory method con validación UUID v4
   */
  static create(id: string): UserId {
    if (!id) {
      throw new Error('El ID de usuario no puede estar vacío');
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('El ID debe ser un UUID v4 válido');
    }

    return new UserId(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
