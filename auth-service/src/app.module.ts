import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';

/**
 * Módulo raíz de la aplicación
 * 
 * Importa AuthModule que contiene toda la lógica de negocio
 * siguiendo arquitectura hexagonal y principios SOLID
 */
@Module({
  imports: [AuthModule],
})
export class AppModule {}
