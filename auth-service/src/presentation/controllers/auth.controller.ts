import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import type {
  ISignUpUseCase,
  ILoginUseCase,
} from '../../domain/ports/inbound';
import {
  SIGN_UP_USE_CASE,
  LOGIN_USE_CASE,
} from '../../domain/ports/inbound';
import {
  SignUpRequestDto,
  LoginRequestDto,
  UserPublicDto,
  LoginResponseDto,
} from '../dtos';
import { Email, Password } from '../../domain/value-objects';

/**
 * Controlador REST para autenticación
 * 
 * Principios aplicados:
 * - SRP: Solo maneja el routing y transformación HTTP <-> Dominio
 * - DIP: Depende de interfaces de casos de uso, no implementaciones
 * - OCP: Extensible sin modificación
 * 
 * Responsabilidades:
 * 1. Validar requests (delegado a class-validator en DTOs)
 * 2. Transformar DTOs a objetos de dominio
 * 3. Invocar casos de uso
 * 4. Transformar resultados a DTOs de respuesta
 * 5. Manejar códigos HTTP apropiados
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(SIGN_UP_USE_CASE)
    private readonly signUpUseCase: ISignUpUseCase,
    @Inject(LOGIN_USE_CASE)
    private readonly loginUseCase: ILoginUseCase,
  ) {}

  /**
   * POST /auth/signup - Registro de usuario
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registro de usuario' })
  @ApiBody({ type: SignUpRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario creado exitosamente',
    type: UserPublicDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El email ya está registrado',
  })
  async signUp(@Body() dto: SignUpRequestDto): Promise<UserPublicDto> {
    // Transformar primitivos a Value Objects del dominio
    const email = Email.create(dto.email);
    const password = Password.create(dto.password);

    // Ejecutar caso de uso
    const result = await this.signUpUseCase.execute({
      email,
      password,
      role: dto.role,
    });

    // Transformar entidad de dominio a DTO de respuesta
    const userPublic = result.user.toPublic();
    
    const response = new UserPublicDto();
    response.id = userPublic.id;
    response.email = userPublic.email;
    response.role = userPublic.role;
    
    return response;
  }

  /**
   * POST /auth/login - Autenticación de usuario
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login y obtención de access token (JWT)' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token JWT emitido exitosamente',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales inválidas',
  })
  async login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    // Transformar primitivos a Value Objects del dominio
    const email = Email.create(dto.email);
    const password = Password.create(dto.password);

    // Ejecutar caso de uso
    const result = await this.loginUseCase.execute({
      email,
      password,
    });

    // Transformar a DTO de respuesta
    const response = new LoginResponseDto();
    response.access_token = result.accessToken;
    
    return response;
  }
}
