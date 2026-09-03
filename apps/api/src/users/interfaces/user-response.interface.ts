import { UserRole } from './user.interface.js';

export interface UsuarioResponse {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: Date | null;
  id_genero: number | null;
  role?: UserRole;
}