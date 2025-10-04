import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la respuesta de login
 * Incluye el token JWT de acceso
 */
export class LoginResponseDto {
  @ApiProperty({
    description: 'Token JWT de acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token!: string;
}
