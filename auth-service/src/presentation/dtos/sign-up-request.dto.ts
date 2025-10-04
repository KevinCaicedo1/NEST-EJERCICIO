import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../domain/value-objects';

/**
 * DTO para la petición de registro (signup)
 * 
 * Validaciones usando class-validator:
 * - Email válido
 * - Password mínimo 6 caracteres
 * - Role opcional, enum válido
 */
export class SignUpRequestDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'luke@rebels.example',
    format: 'email',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email!: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'secret123',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario',
    enum: Role,
    example: Role.USER,
    default: Role.USER,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'El rol debe ser USER o ADMIN' })
  role?: Role;
}
