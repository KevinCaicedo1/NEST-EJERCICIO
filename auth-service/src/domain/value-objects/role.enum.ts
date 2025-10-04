/**
 * Role Enum - Define los roles disponibles en el sistema
 * Siguiendo el principio Open/Closed: extensible sin modificar código existente
 */
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

/**
 * Type guard para validar si un string es un Role válido
 */
export function isValidRole(value: string): value is Role {
  return Object.values(Role).includes(value as Role);
}
