import { UserRole } from './user.interface.js';

export interface UsuarioResponse {
id: number;
id_genero: number;
nombre: string;
apellido: string;
fecha_nacimiento: Date;
email: string;
}