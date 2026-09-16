export interface JwtUser {
  id: number;
  email?: string;
  telefono?: string;
  roles_usuario: string[];
  isApproved: boolean;
}