import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../../src/presentation/controllers/auth.controller';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import {
  SIGN_UP_USE_CASE,
  LOGIN_USE_CASE,
} from '../../../../src/domain/ports/inbound';
import type {
  ISignUpUseCase,
  ILoginUseCase,
} from '../../../../src/domain/ports/inbound';
import { SignUpRequestDto, LoginRequestDto } from '../../../../src/presentation/dtos';
import { User } from '../../../../src/domain/entities/user.entity';
import { Email, Password, UserId } from '../../../../src/domain/value-objects';
import { Role } from '../../../../src/domain/value-objects/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let signUpUseCase: jest.Mocked<ISignUpUseCase>;
  let loginUseCase: jest.Mocked<ILoginUseCase>;

  beforeEach(async () => {
    // Mocks de los casos de uso
    const mockSignUpUseCase = {
      execute: jest.fn(),
    };

    const mockLoginUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: SIGN_UP_USE_CASE,
          useValue: mockSignUpUseCase,
        },
        {
          provide: LOGIN_USE_CASE,
          useValue: mockLoginUseCase,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    signUpUseCase = module.get(SIGN_UP_USE_CASE);
    loginUseCase = module.get(LOGIN_USE_CASE);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/signup', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      // Arrange
      const dto: SignUpRequestDto = {
        email: 'test@example.com',
        password: 'Password123!',
        role: Role.USER,
      };

      const mockUser = User.reconstitute({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
        email: Email.create('test@example.com'),
        passwordHash: Password.create('hashedPassword'),
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      signUpUseCase.execute.mockResolvedValue({ user: mockUser });

      // Act
      const result = await controller.signUp(dto);

      // Assert
      expect(result).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        role: Role.USER,
      });
      expect(signUpUseCase.execute).toHaveBeenCalledWith({
        email: expect.any(Email),
        password: expect.any(Password),
        role: Role.USER,
      });
    });

    it('debe lanzar ConflictException si el email ya existe', async () => {
      // Arrange
      const dto: SignUpRequestDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        role: Role.USER,
      };

      signUpUseCase.execute.mockRejectedValue(
        new ConflictException('El email existing@example.com ya está registrado'),
      );

      // Act & Assert
      await expect(controller.signUp(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('POST /auth/login', () => {
    it('debe autenticar un usuario y retornar un token JWT', async () => {
      // Arrange
      const dto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      loginUseCase.execute.mockResolvedValue({ accessToken: mockToken });

      // Act
      const result = await controller.login(dto);

      // Assert
      expect(result).toEqual({
        access_token: mockToken,
      });
      expect(loginUseCase.execute).toHaveBeenCalledWith({
        email: expect.any(Email),
        password: expect.any(Password),
      });
    });

    it('debe lanzar UnauthorizedException con credenciales inválidas', async () => {
      // Arrange
      const dto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      loginUseCase.execute.mockRejectedValue(
        new UnauthorizedException('Credenciales inválidas'),
      );

      // Act & Assert
      await expect(controller.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
