import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain
import {
  USER_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_GENERATOR,
} from './domain/ports/outbound';
import {
  SIGN_UP_USE_CASE,
  LOGIN_USE_CASE,
} from './domain/ports/inbound';

// Application
import { SignUpUseCase } from './application/use-cases/sign-up.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';

// Infrastructure
import {
  TypeOrmUserRepository,
  UserEntity,
} from './infrastructure/adapters/outbound/persistence';
import {
  BcryptPasswordHasher,
  JwtTokenGenerator,
} from './infrastructure/adapters/outbound/security';
import { DatabaseModule } from './infrastructure/config/database.module';

// Presentation
import { AuthController } from './presentation/controllers';

/**
 * Módulo principal de autenticación
 * 
 * Configuración de Inyección de Dependencias siguiendo SOLID:
 * 
 * 1. Casos de Uso (Application Layer):
 *    - Implementan interfaces inbound (ISignUpUseCase, ILoginUseCase)
 *    - Se registran con sus símbolos correspondientes
 * 
 * 2. Adaptadores (Infrastructure Layer):
 *    - Implementan interfaces outbound (IUserRepository, IPasswordHasher, etc.)
 *    - Se registran con sus símbolos correspondientes
 * 
 * Ventajas de este enfoque:
 * - Inversión de Dependencias: las capas superiores dependen de abstracciones
 * - Testeable: fácil mockear las dependencias usando los símbolos
 * - Flexible: puedes cambiar implementaciones sin modificar consumidores
 * - Clean: las capas no se conocen entre sí directamente
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    DatabaseModule,
    // Registrar la entidad TypeORM para poder usar el repositorio
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key-change-in-production'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // ============================================
    // Application Layer - Use Cases (Inbound Ports)
    // ============================================
    {
      provide: SIGN_UP_USE_CASE,
      useClass: SignUpUseCase,
    },
    {
      provide: LOGIN_USE_CASE,
      useClass: LoginUseCase,
    },

    // ============================================
    // Infrastructure Layer - Adapters (Outbound Ports)
    // ============================================
    
    // Repository - Ahora usando TypeORM
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },

    // Security
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_GENERATOR,
      useClass: JwtTokenGenerator,
    },
  ],
})
export class AuthModule {}
