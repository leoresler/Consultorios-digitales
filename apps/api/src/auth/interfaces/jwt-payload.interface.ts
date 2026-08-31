import { UserRole } from '../../users/interfaces/user.interface.js';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}