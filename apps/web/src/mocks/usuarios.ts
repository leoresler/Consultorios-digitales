import type { Usuario } from '@/models';

/**
 * Usuarios de la tabla `usuarios`.
 * La columna Contraseña NO se mockea aquí por seguridad; las credenciales
 * del login mock viven en `credencialesMock` (services/api/mockApi).
 */
export const usuariosMock: Usuario[] = [
  // ---- Pacientes ----
  { Id: 1, Id_genero: 1, Nombre: 'Lucía', Apellido: 'Fernández', Fecha_Nacimiento: '1990-04-12', Email: 'lucia.fernandez@example.com' },
  { Id: 2, Id_genero: 2, Nombre: 'Carlos', Apellido: 'Gómez', Fecha_Nacimiento: '1985-09-30', Email: 'carlos.gomez@example.com' },
  { Id: 3, Id_genero: 1, Nombre: 'María', Apellido: 'López', Fecha_Nacimiento: '2015-03-22', Email: 'maria.lopez.tutor@example.com' },
  { Id: 4, Id_genero: 2, Nombre: 'Diego', Apellido: 'Torres', Fecha_Nacimiento: '1978-11-05', Email: 'diego.torres@example.com' },
  // ---- Médicos ----
  { Id: 10, Id_genero: 1, Nombre: 'Ana', Apellido: 'Martínez', Fecha_Nacimiento: '1980-02-18', Email: 'ana.martinez@clinica.com' },
  { Id: 11, Id_genero: 2, Nombre: 'Juan', Apellido: 'Pérez', Fecha_Nacimiento: '1975-07-09', Email: 'juan.perez@clinica.com' },
  { Id: 12, Id_genero: 1, Nombre: 'Sofía', Apellido: 'Ruiz', Fecha_Nacimiento: '1988-12-01', Email: 'sofia.ruiz@clinica.com' },
  { Id: 13, Id_genero: 2, Nombre: 'Pedro', Apellido: 'Sánchez', Fecha_Nacimiento: '1982-05-27', Email: 'pedro.sanchez@clinica.com' },
  { Id: 14, Id_genero: 2, Nombre: 'Martín', Apellido: 'Ferreyra', Fecha_Nacimiento: '1991-10-14', Email: 'martin.ferreyra@clinica.com' },
  // ---- Personal interno ----
  { Id: 20, Id_genero: 1, Nombre: 'Laura', Apellido: 'Díaz', Fecha_Nacimiento: '1995-06-03', Email: 'recepcion@clinica.com' },
  { Id: 21, Id_genero: 2, Nombre: 'Admin', Apellido: 'General', Fecha_Nacimiento: '1990-01-01', Email: 'admin@clinica.com' },
];

/**
 * MOCK-ONLY: credenciales simuladas. En producción esto vive SOLO en el
 * backend (hashing incluido) — ver DISCREPANCIAS #4.
 */
export interface CredencialMock {
  Email: string;
  /** Claro solo porque es un fixture local; jamás hacer esto en backend. */
  ContrasenaPlano: string;
}

export const credencialesMock: CredencialMock[] = [
  { Email: 'juan.perez@clinica.com', ContrasenaPlano: 'medico123' },
  { Email: 'ana.martinez@clinica.com', ContrasenaPlano: 'medico123' },
  { Email: 'recepcion@clinica.com', ContrasenaPlano: 'recepcion123' },
  { Email: 'admin@clinica.com', ContrasenaPlano: 'admin123' },
];
