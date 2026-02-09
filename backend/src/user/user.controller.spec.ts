import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { UserController } from './user.controller';
import { UserService } from './user.service';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
  Prisma: {
    Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
  },
  Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
}));

const req = {
  user: {
    id: 'user_1',
    email: 'admin@test.com',
    role: 'ADMIN',
  },
};

describe('UserController', () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      list: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: service }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('returns req.user', () => {
    expect(controller.user(req as any)).toEqual(req.user);
  });

  it('create calls service', async () => {
    service.create.mockResolvedValueOnce({
      id: 'user_2',
      name: 'Somchai',
      email: 'member@test.com',
      role: Role.MEMBER,
    });

    await controller.create(
      {
        name: 'Somchai',
        email: 'member@test.com',
        password: 'password123',
        role: Role.MEMBER,
      },
      req as any,
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.create).toHaveBeenCalledWith(
      {
        name: 'Somchai',
        email: 'member@test.com',
        password: 'password123',
        role: Role.MEMBER,
      },
      Role.ADMIN,
    );
  });

  it('list calls service', async () => {
    service.list = jest.fn().mockResolvedValueOnce([]);

    await controller.list();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.list).toHaveBeenCalled();
  });
});
