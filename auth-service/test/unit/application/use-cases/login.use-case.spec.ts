import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from '../../../../src/application/use-cases/login.use-case';
import {
  USER_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_GENERATOR,
} from '../../../../src/domain/ports/outbound';
import type {
  IUserRepository,
  IPasswordHasher,
  ITokenGenerator,
} from '../../../../src/domain/ports/outbound';
import { User } from '../../../../src/domain/entities/user.entity';
import { Email, Password, UserId } from '../../../../src/domain/value-objects';
import { Role } from '../../../../src/domain/value-objects/role.enum';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let tokenGenerator: jest.Mocked<ITokenGenerator>;

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
    };

    const mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const mockTokenGenerator = {
      generateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: PASSWORD_HASHER,
          useValue: mockPasswordHasher,
        },
        {
          provide: TOKEN_GENERATOR,
          useValue: mockTokenGenerator,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get(USER_REPOSITORY);
    passwordHasher = module.get(PASSWORD_HASHER);
    tokenGenerator = module.get(TOKEN_GENERATOR);
  });

  it('debe estar definido', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('debe autenticar exitosamente y retornar un token JWT', async () => {
      // Arrange
      const email = Email.create('test@example.com');
      const password = Password.create('Password123!');

      const mockUser = User.reconstitute({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
        email,
        passwordHash: Password.create('$2b$10$hashedPassword'),
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(true);
      tokenGenerator.generateToken.mockResolvedValue(expectedToken);

      // Act
      const result = await useCase.execute({ email, password });

      // Assert
      expect(result.accessToken).toBe(expectedToken);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(passwordHasher.compare).toHaveBeenCalledWith(
        password,
        mockUser.getPasswordHash(),
      );
      expect(tokenGenerator.generateToken).toHaveBeenCalledWith(mockUser);
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      // Arrange
      const email = Email.create('noexiste@example.com');
      const password = Password.create('Password123!');

      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute({ email, password })).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute({ email, password })).rejects.toThrow(
        'Credenciales inválidas',
      );
      expect(passwordHasher.compare).not.toHaveBeenCalled();
      expect(tokenGenerator.generateToken).not.toHaveBeenCalled();
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      // Arrange
      const email = Email.create('test@example.com');
      const password = Password.create('WrongPassword123!');

      const mockUser = User.reconstitute({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440001'),
        email,
        passwordHash: Password.create('$2b$10$hashedPassword'),
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute({ email, password })).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute({ email, password })).rejects.toThrow(
        'Credenciales inválidas',
      );
      expect(tokenGenerator.generateToken).not.toHaveBeenCalled();
    });

    it('debe validar la contraseña con el hash almacenado', async () => {
      // Arrange
      const email = Email.create('test@example.com');
      const password = Password.create('Password123!');

      const hashedPassword = Password.create('$2b$10$correctHashedPassword');
      const mockUser = User.reconstitute({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440002'),
        email,
        passwordHash: hashedPassword,
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(true);
      tokenGenerator.generateToken.mockResolvedValue('token123');

      // Act
      await useCase.execute({ email, password });

      // Assert
      expect(passwordHasher.compare).toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
    });

    it('debe utilizar todas las dependencias inyectadas correctamente', async () => {
      // Arrange
      const email = Email.create('test@example.com');
      const password = Password.create('Password123!');

      const mockUser = User.reconstitute({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440003'),
        email,
        passwordHash: Password.create('$2b$10$hashedPassword'),
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(true);
      tokenGenerator.generateToken.mockResolvedValue('token123');

      // Act
      await useCase.execute({ email, password });

      // Assert - Verificar que todas las dependencias fueron llamadas
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(passwordHasher.compare).toHaveBeenCalledTimes(1);
      expect(tokenGenerator.generateToken).toHaveBeenCalledTimes(1);
    });
  });
});
