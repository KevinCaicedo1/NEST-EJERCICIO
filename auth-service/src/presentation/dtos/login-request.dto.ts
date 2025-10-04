import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la petición de login
 * 
 * Validaciones usando class-validator:
 * - Email válido
 * - Password requerido
 */
export class LoginRequestDto {
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
  })
  @IsString({ message: 'La contraseña es requerida' })
  password!: string;
}
