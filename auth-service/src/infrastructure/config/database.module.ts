import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from '../adapters/outbound/persistence/entities/user.entity.typeorm';

/**
 * Módulo de infraestructura para PostgreSQL con TypeORM
 * 
 * Características:
 * - TypeORM como ORM para PostgreSQL
 * - Connection pooling automático
 * - Migrations y sincronización de esquema
 * - Type-safe queries
 * 
 * Principio DIP: Proporciona la implementación de persistencia
 * que será inyectada a través de los repositorios
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'authuser'),
        password: configService.get<string>('DB_PASSWORD', 'authpass'),
        database: configService.get<string>('DB_NAME', 'authdb'),
        entities: [UserEntity],
        
        // Configuración de sincronización
        // IMPORTANTE: En producción usa migrations en lugar de synchronize
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        
        // Logging de queries (útil para debug)
        logging: configService.get<string>('NODE_ENV') === 'development',
        
        // Pool de conexiones
        extra: {
          max: 20, // Máximo de conexiones
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
