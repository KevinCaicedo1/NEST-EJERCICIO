import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { SignUpUseCase } from '../../../../src/application/use-cases/sign-up.use-case';
import {
  USER_REPOSITORY,
  PASSWORD_HASHER,
} from '../../../../src/domain/ports/outbound';
import type {
  IUserRepository,
  IPasswordHasher,
} from '../../../../src/domain/ports/outbound';
import { User } from '../../../../src/domain/entities/user.entity';
import { Email, Password, UserId } from '../../../../src/domain/value-objects';
import { Role } from '../../../../src/domain/value-objects/role.enum';

describe('SignUpUseCase', () => {
  let useCase: SignUpUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignUpUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: PASSWORD_HASHER,
          useValue: mockPasswordHasher,
        },
      ],
    }).compile();

    useCase = module.get<SignUpUseCase>(SignUpUseCase);
    userRepository = module.get(USER_REPOSITORY);
    passwordHasher = module.get(PASSWORD_HASHER);
  });

  it('debe estar definido', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      // Arrange
      const email = Email.create('newuser@example.com');
      const password = Password.create('Password123!');
      const role = Role.USER;

      const hashedPassword = Password.create('$2b$10$hashedPassword');
      const savedUser = User.reconstitute({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
        email,
        passwordHash: hashedPassword,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue(hashedPassword);
      userRepository.save.mockResolvedValue(savedUser);

      // Act
      const result = await useCase.execute({ email, password, role });

      // Assert
      expect(result.user).toEqual(savedUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(passwordHasher.hash).toHaveBeenCalledWith(password);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si el email ya existe', async () => {
      // Arrange
      const email = Email.create('existing@example.com');
      const password = Password.create('Password123!');

      const existingUser = User.reconstitute({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440001'),
        email,
        passwordHash: Password.create('$2b$10$hashedPassword'),
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(
        useCase.execute({ email, password, role: Role.USER }),
      ).rejects.toThrow(ConflictException);

      await expect(
        useCase.execute({ email, password, role: Role.USER }),
      ).rejects.toThrow(`El email ${email.getValue()} ya está registrado`);

      expect(passwordHasher.hash).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('debe hashear la contraseña antes de guardar', async () => {
      // Arrange
      const email = Email.create('test@example.com');
      const password = Password.create('PlainPassword123!');
      const hashedPassword = Password.create('$2b$10$hashedSecurePassword');

      const savedUser = User.reconstitute({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440002'),
        email,
        passwordHash: hashedPassword,
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue(hashedPassword);
      userRepository.save.mockResolvedValue(savedUser);

      // Act
      await useCase.execute({ email, password, role: Role.USER });

      // Assert
      expect(passwordHasher.hash).toHaveBeenCalledWith(password);
      expect(passwordHasher.hash).toHaveBeenCalledTimes(1);

      // Verificar que el usuario guardado tiene la contraseña hasheada
      const saveCall = userRepository.save.mock.calls[0][0];
      expect(saveCall.getPasswordHash()).toEqual(hashedPassword);
    });

    it('debe asignar el rol USER por defecto si no se especifica', async () => {
      // Arrange
      const email = Email.create('test@example.com');
      const password = Password.create('Password123!');
      const hashedPassword = Password.create('$2b$10$hashedPassword');

      const savedUser = User.reconstitute({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440003'),
        email,
        passwordHash: hashedPassword,
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue(hashedPassword);
      userRepository.save.mockResolvedValue(savedUser);

      // Act - Sin especificar rol
      const result = await useCase.execute({
        email,
        password,
        role: undefined,
      });

      // Assert
      expect(result.user.getRole()).toBe(Role.USER);
    });

    it('debe persistir el usuario en el repositorio', async () => {
      // Arrange
      const email = Email.create('test@example.com');
      const password = Password.create('Password123!');
      const hashedPassword = Password.create('$2b$10$hashedPassword');

      const savedUser = User.reconstitute({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440004'),
        email,
        passwordHash: hashedPassword,
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue(hashedPassword);
      userRepository.save.mockResolvedValue(savedUser);

      // Act
      await useCase.execute({ email, password, role: Role.ADMIN });

      // Assert
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          getEmail: expect.any(Function),
          getPasswordHash: expect.any(Function),
          getRole: expect.any(Function),
        }),
      );
    });
  });
});
