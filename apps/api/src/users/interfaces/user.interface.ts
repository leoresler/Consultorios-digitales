// src/usuarios/interfaces/user.interface.ts

export interface Usuario {
  id: number;
  id_genero: number | null;
  nombre: string;
  apellido: string;
  fecha_nacimiento: Date | null;
  email: string;
  contrasena: string;
}

export type UserRole = 'ADMIN' | 'PACIENTE' | 'MEDICO';