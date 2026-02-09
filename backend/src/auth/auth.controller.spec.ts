import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
  Prisma: {
    Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
  },
  Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
}));

const loginDto = {
  email: 'admin@test.com',
  password: 'password123',
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    service = {
      login: jest.fn(),
      logout: jest.fn(),
      refresh: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('login calls service', async () => {
    service.login.mockResolvedValueOnce({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: 'user_1', email: 'admin@test.com', role: Role.ADMIN },
    });

    const res = { cookie: jest.fn() } as any;
    await controller.login(loginDto, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.login).toHaveBeenCalledWith(
      loginDto.email,
      loginDto.password,
    );
    expect(res.cookie).toHaveBeenCalled();
  });

  it('logout calls service', async () => {
    service.logout.mockResolvedValueOnce({ message: 'Logged out' });

    await controller.logout(
      {
        user: {
          userId: 'user_1',
          email: 'admin@test.com',
          role: Role.ADMIN,
          exp: 1700000000,
        },
      } as any,
      { clearCookie: jest.fn() } as any,
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.logout).toHaveBeenCalledWith({
      userId: 'user_1',
      email: 'admin@test.com',
      role: Role.ADMIN,
      exp: 1700000000,
    });
  });

  it('refresh calls service', async () => {
    service.refresh.mockResolvedValueOnce({
      accessToken: 'token',
      refreshToken: 'refresh',
    });

    const res = { cookie: jest.fn() } as any;
    await controller.refresh(
      { cookies: { refreshToken: 'refresh' } } as any,
      res,
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.refresh).toHaveBeenCalledWith('refresh');
    expect(res.cookie).toHaveBeenCalled();
  });
});
