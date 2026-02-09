import { Role } from '@prisma/client';

export type JwtPayload = {
  sub: string;
  name: string;
  email: string;
  role: Role;
  exp?: number;
};

export type AuthUserPayload = {
  userId: string;
  name: string;
  email: string;
  role: Role;
  exp?: number;
};
