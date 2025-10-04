import { Role } from '../enums/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface UserFromToken {
  id: string;
  email: string;
  role: Role;
}
