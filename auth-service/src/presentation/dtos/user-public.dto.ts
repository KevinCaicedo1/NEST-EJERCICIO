import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../domain/value-objects';

/**
 * DTO para la respuesta de usuario público
 * No incluye información sensible como el password hash
 */
export class UserPublicDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'luke@rebels.example',
    format: 'email',
  })
  email!: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: Role,
    example: Role.USER,
  })
  role!: Role;
}
