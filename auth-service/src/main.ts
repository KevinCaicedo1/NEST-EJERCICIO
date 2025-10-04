import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Bootstrap de la aplicación
 * 
 * Configuraciones:
 * - ValidationPipe global para validación de DTOs
 * - Swagger para documentación de API
 * - CORS habilitado
 * - Puerto configurable via ENV
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Global Validation Pipe - valida todos los DTOs automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true, // Transforma payloads a instancias de DTO
      transformOptions: {
        enableImplicitConversion: true, // Convierte tipos automáticamente
      },
    }),
  );

  // Habilitar CORS
  app.enableCors();

  // Configuración de Swagger (OpenAPI)
  const config = new DocumentBuilder()
    .setTitle('Auth Service')
    .setDescription('Servicio de autenticación y gestión de usuarios (signup/login con JWT)')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer('http://localhost:3001', 'Dev')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log('\n🚀 Auth Service iniciado correctamente');
  console.log(`📡 API disponible en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api-docs\n`);
}

bootstrap();
