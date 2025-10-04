import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenGenerator } from '../../../../../../src/infrastructure/adapters/outbound/security/jwt-token-generator.adapter';
import { User } from '../../../../../../src/domain/entities/user.entity';
import { Email, Password, UserId } from '../../../../../../src/domain/value-objects';
import { Role } from '../../../../../../src/domain/value-objects/role.enum';
import type { JwtPayload } from '../../../../../../src/domain/ports/outbound';

describe('JwtTokenGenerator', () => {
  let tokenGenerator: JwtTokenGenerator;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenGenerator,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    tokenGenerator = module.get<JwtTokenGenerator>(JwtTokenGenerator);
    jwtService = module.get(JwtService);
  });

  it('debe estar definido', () => {
    expect(tokenGenerator).toBeDefined();
  });

  describe('generateToken', () => {
    it('debe generar un token JWT con el payload correcto del usuario', async () => {
      // Arrange
      const user = User.reconstitute({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
        email: Email.create('test@example.com'),
        passwordHash: Password.create('$2b$10$hashedPassword'),
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc123';
      jwtService.signAsync.mockResolvedValue(expectedToken);

      // Act
      const result = await tokenGenerator.generateToken(user);

      // Assert
      expect(result).toBe(expectedToken);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        role: Role.USER,
      });
    });

    it('debe generar diferentes tokens para usuarios con diferentes roles', async () => {
      // Arrange
      const adminUser = User.reconstitute({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440001'),
        email: Email.create('admin@example.com'),
        passwordHash: Password.create('$2b$10$hashedPassword'),
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const regularUser = User.reconstitute({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440002'),
        email: Email.create('user@example.com'),
        passwordHash: Password.create('$2b$10$hashedPassword'),
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const adminToken = 'admin.token.signature';
      const userToken = 'user.token.signature';

      jwtService.signAsync
        .mockResolvedValueOnce(adminToken)
        .mockResolvedValueOnce(userToken);

      // Act
      const adminResult = await tokenGenerator.generateToken(adminUser);
      const userResult = await tokenGenerator.generateToken(regularUser);

      // Assert
      expect(adminResult).toBe(adminToken);
      expect(userResult).toBe(userToken);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.ADMIN }),
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.USER }),
      );
    });
  });

  describe('verifyToken', () => {
    it('debe verificar un token válido y retornar el payload', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      const expectedPayload: JwtPayload = {
        sub: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        role: Role.USER,
      };

      jwtService.verifyAsync.mockResolvedValue(expectedPayload);

      // Act
      const result = await tokenGenerator.verifyToken(token);

      // Assert
      expect(result).toEqual(expectedPayload);
      expect(result.sub).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.email).toBe('test@example.com');
      expect(result.role).toBe(Role.USER);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token);
    });

    it('debe lanzar error si el token es inválido', async () => {
      // Arrange
      const invalidToken = 'invalid.token.signature';
      const error = new Error('Invalid token');

      jwtService.verifyAsync.mockRejectedValue(error);

      // Act & Assert
      await expect(tokenGenerator.verifyToken(invalidToken)).rejects.toThrow('Invalid token');
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(invalidToken);
    });

    it('debe extraer correctamente el payload con todos los campos necesarios', async () => {
      // Arrange
      const token = 'complete.jwt.token';
      const payload: JwtPayload = {
        sub: '550e8400-e29b-41d4-a716-446655440003',
        email: 'admin@example.com',
        role: Role.ADMIN,
      };

      jwtService.verifyAsync.mockResolvedValue(payload);

      // Act
      const result = await tokenGenerator.verifyToken(token);

      // Assert
      expect(result).toHaveProperty('sub');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
      expect(result.sub).toBe('550e8400-e29b-41d4-a716-446655440003');
      expect(result.email).toBe('admin@example.com');
      expect(result.role).toBe(Role.ADMIN);
    });
  });
});
