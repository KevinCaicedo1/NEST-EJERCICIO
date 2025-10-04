import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../../src/infrastructure/http/guards/roles.guard';
import { Role } from '../../../src/domain/enums/role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);

    mockRequest = { user: undefined };
    mockExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access when no roles are required', () => {
    mockRequest.user = { userId: '123', role: Role.USER };
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    const result = guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
  });

  it('should allow access when user has required role', () => {
    mockRequest.user = { userId: '123', role: Role.ADMIN };
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);

    const result = guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
  });

  it('should deny access when user is not authenticated', () => {
    mockRequest.user = undefined;
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.USER]);

    expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
  });

  it('should deny access when user lacks required role', () => {
    mockRequest.user = { userId: '123', role: Role.USER };
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
  });

  it('should allow access when user has one of multiple required roles', () => {
    mockRequest.user = { userId: '123', role: Role.USER };
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.USER, Role.ADMIN]);

    const result = guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
  });
});