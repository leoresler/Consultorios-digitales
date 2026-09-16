export interface JwtPayload {
  sub: number;
  email?: string;
  telefono?: string;
  roles_usuario: string[];
}