import { UserRole } from '../../users/interfaces/user.interface.js';

export interface JwtUser {
  id: number;
  email: string;
  role: UserRole;
}