import { registerAs } from '@nestjs/config';

/**
 * Configuración type-safe para JWT
 */
export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-change-me',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
}));

/**
 * Tipo para autocompletado
 */
export type JwtConfig = ReturnType<typeof jwtConfig>;
