import { registerAs } from '@nestjs/config';

/**
 * Configuración type-safe para la aplicación
 */
export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}));

/**
 * Tipo para autocompletado
 */
export type AppConfig = ReturnType<typeof appConfig>;
