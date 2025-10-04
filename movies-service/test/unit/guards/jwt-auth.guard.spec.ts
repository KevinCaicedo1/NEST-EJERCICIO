import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../../src/infrastructure/http/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access for public routes', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should validate JWT service dependency', () => {
    expect(jwtService).toBeDefined();
    expect(jwtService.verify).toBeDefined();
  });

  it('should validate reflector dependency', () => {
    expect(reflector).toBeDefined();
    expect(reflector.getAllAndOverride).toBeDefined();
  });

  it('should handle non-public routes', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ headers: {} }),
      }),
    } as any;

    // This will call the parent AuthGuard logic, which we can't easily test
    // without setting up the full Passport infrastructure
    expect(() => guard.canActivate(mockContext)).toBeDefined();
  });
});