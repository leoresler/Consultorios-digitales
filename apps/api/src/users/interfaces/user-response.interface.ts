//import { UserRole } from './user.interface.js';

export interface UsuarioResponse {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  isApproved: boolean;
  fecha_nacimiento: Date | null;
  id_genero: number | null;
  roles_usuario: string[];
}