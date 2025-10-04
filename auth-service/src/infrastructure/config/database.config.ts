import { registerAs } from '@nestjs/config';

/**
 * Configuración type-safe para la base de datos
 */
export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'authuser',
  password: process.env.DB_PASSWORD || 'authpass',
  database: process.env.DB_NAME || 'authdb',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
}));

/**
 * Tipo para autocompletado
 */
export type DatabaseConfig = ReturnType<typeof databaseConfig>;
