import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmUserRepository } from '../../../../../../src/infrastructure/adapters/outbound/persistence/typeorm-user.repository';
import { UserEntity } from '../../../../../../src/infrastructure/adapters/outbound/persistence/entities/user.entity.typeorm';
import { User } from '../../../../../../src/domain/entities/user.entity';
import { Email, Password, UserId } from '../../../../../../src/domain/value-objects';
import { Role } from '../../../../../../src/domain/value-objects/role.enum';

describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let typeOrmRepository: jest.Mocked<Repository<UserEntity>>;

  beforeEach(async () => {
    const mockTypeOrmRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmUserRepository,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmUserRepository>(TypeOrmUserRepository);
    typeOrmRepository = module.get(getRepositoryToken(UserEntity));
  });

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  describe('findByEmail', () => {
    it('debe encontrar un usuario por email y mapearlo al dominio', async () => {
      // Arrange
      const email = Email.create('test@example.com');
      const mockEntity: UserEntity = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        passwordHash: '$2b$10$hashedPassword',
        role: Role.USER,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      typeOrmRepository.findOne.mockResolvedValue(mockEntity);

      // Act
      const result = await repository.findByEmail(email);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result?.getId().getValue()).toBe(mockEntity.id);
      expect(result?.getEmail().getValue()).toBe(mockEntity.email);
      expect(result?.getRole()).toBe(Role.USER);
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('debe retornar null si el usuario no existe', async () => {
      // Arrange
      const email = Email.create('noexiste@example.com');
      typeOrmRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await repository.findByEmail(email);

      // Assert
      expect(result).toBeNull();
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'noexiste@example.com' },
      });
    });
  });

  describe('findById', () => {
    it('debe encontrar un usuario por ID y mapearlo al dominio', async () => {
      // Arrange
      const userId = UserId.create('550e8400-e29b-41d4-a716-446655440000');
      const mockEntity: UserEntity = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        passwordHash: '$2b$10$hashedPassword',
        role: Role.ADMIN,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      typeOrmRepository.findOne.mockResolvedValue(mockEntity);

      // Act
      const result = await repository.findById(userId);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result?.getId().getValue()).toBe(mockEntity.id);
      expect(result?.getRole()).toBe(Role.ADMIN);
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: '550e8400-e29b-41d4-a716-446655440000' },
      });
    });
  });

  describe('save', () => {
    it('debe guardar un nuevo usuario y retornarlo como entidad de dominio', async () => {
      // Arrange
      const email = Email.create('newuser@example.com');
      const password = Password.create('$2b$10$hashedPassword');
      const role = Role.USER;

      const userToSave = User.create({
        email,
        passwordHash: password,
        role,
      });

      const mockCreatedEntity: Partial<UserEntity> = {
        email: 'newuser@example.com',
        passwordHash: '$2b$10$hashedPassword',
        role: Role.USER,
      };

      const mockSavedEntity: UserEntity = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'newuser@example.com',
        passwordHash: '$2b$10$hashedPassword',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      typeOrmRepository.create.mockReturnValue(mockCreatedEntity as UserEntity);
      typeOrmRepository.save.mockResolvedValue(mockSavedEntity);

      // Act
      const result = await repository.save(userToSave);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result.getEmail().getValue()).toBe('newuser@example.com');
      expect(result.getRole()).toBe(Role.USER);
      expect(typeOrmRepository.create).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        passwordHash: '$2b$10$hashedPassword',
        role: Role.USER,
      });
      expect(typeOrmRepository.save).toHaveBeenCalled();
    });
  });

  describe('existsByEmail', () => {
    it('debe retornar true si el email existe', async () => {
      // Arrange
      const email = Email.create('existing@example.com');
      typeOrmRepository.count.mockResolvedValue(1);

      // Act
      const result = await repository.existsByEmail(email);

      // Assert
      expect(result).toBe(true);
      expect(typeOrmRepository.count).toHaveBeenCalledWith({
        where: { email: 'existing@example.com' },
      });
    });

    it('debe retornar false si el email no existe', async () => {
      // Arrange
      const email = Email.create('noexiste@example.com');
      typeOrmRepository.count.mockResolvedValue(0);

      // Act
      const result = await repository.existsByEmail(email);

      // Assert
      expect(result).toBe(false);
      expect(typeOrmRepository.count).toHaveBeenCalledWith({
        where: { email: 'noexiste@example.com' },
      });
    });
  });
});
