import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { BcryptPasswordHasher } from '../../../../../../src/infrastructure/adapters/outbound/security/bcrypt-password-hasher.adapter';
import { Password } from '../../../../../../src/domain/value-objects';

// Mock del módulo bcrypt
jest.mock('bcrypt');

describe('BcryptPasswordHasher', () => {
  let hasher: BcryptPasswordHasher;
  const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptPasswordHasher],
    }).compile();

    hasher = module.get<BcryptPasswordHasher>(BcryptPasswordHasher);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(hasher).toBeDefined();
  });

  describe('hash', () => {
    it('debe hashear una contraseña usando bcrypt con 10 salt rounds', async () => {
      // Arrange
      const plainPassword = Password.create('MySecurePassword123!');
      const hashedValue = '$2b$10$hashedPasswordValue123';
      
      mockedBcrypt.hash.mockResolvedValue(hashedValue as never);

      // Act
      const result = await hasher.hash(plainPassword);

      // Assert
      expect(result).toBeInstanceOf(Password);
      expect(result.getValue()).toBe(hashedValue);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('MySecurePassword123!', 10);
    });

    it('debe retornar un Password con formato de hash válido', async () => {
      // Arrange
      const plainPassword = Password.create('AnotherPassword456!');
      const hashedValue = '$2b$10$anotherHashedValue456';
      
      mockedBcrypt.hash.mockResolvedValue(hashedValue as never);

      // Act
      const result = await hasher.hash(plainPassword);

      // Assert
      expect(result.getValue()).toMatch(/^\$2b\$10\$/);
      expect(result.getValue()).toBe(hashedValue);
    });
  });

  describe('compare', () => {
    it('debe retornar true cuando la contraseña coincide con el hash', async () => {
      // Arrange
      const plainPassword = Password.create('CorrectPassword123!');
      const hashedPassword = Password.create('$2b$10$hashedPasswordValue');
      
      mockedBcrypt.compare.mockResolvedValue(true as never);

      // Act
      const result = await hasher.compare(plainPassword, hashedPassword);

      // Assert
      expect(result).toBe(true);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'CorrectPassword123!',
        '$2b$10$hashedPasswordValue',
      );
    });

    it('debe retornar false cuando la contraseña no coincide con el hash', async () => {
      // Arrange
      const plainPassword = Password.create('WrongPassword123!');
      const hashedPassword = Password.create('$2b$10$hashedPasswordValue');
      
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act
      const result = await hasher.compare(plainPassword, hashedPassword);

      // Assert
      expect(result).toBe(false);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'WrongPassword123!',
        '$2b$10$hashedPasswordValue',
      );
    });

    it('debe comparar correctamente diferentes contraseñas', async () => {
      // Arrange
      const plainPassword1 = Password.create('Password123!');
      const plainPassword2 = Password.create('DifferentPass456!');
      const hashedPassword = Password.create('$2b$10$hashForPassword123');
      
      mockedBcrypt.compare
        .mockResolvedValueOnce(true as never)  // Primera comparación
        .mockResolvedValueOnce(false as never); // Segunda comparación

      // Act
      const result1 = await hasher.compare(plainPassword1, hashedPassword);
      const result2 = await hasher.compare(plainPassword2, hashedPassword);

      // Assert
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(mockedBcrypt.compare).toHaveBeenCalledTimes(2);
    });
  });
});
