/**
 * Tabla `usuarios` — espejo fiel del DDL.
 *
 * NOTA DE SEGURIDAD: la columna `Contraseña` existe en la BD pero NUNCA
 * debe viajar al frontend. Se omite deliberadamente de este modelo.
 *
 * DISCREPANCIAS #4: la BD no modela roles. `RolMock` y `UsuarioAutenticado`
 * son MOCK-ONLY hasta que el backend incorpore roles reales.
 */
export interface Usuario {
  Id: number;
  Id_genero: number | null;
  Nombre: string;
  Apellido: string;
  /** DATE 'YYYY-MM-DD' */
  Fecha_Nacimiento: string;
  Email: string;
}

/**
 * MOCK-ONLY: rol simulado client-side (no existe en la BD actual).
 */
export type RolMock = 'medico' | 'recepcion' | 'admin';

/**
 * MOCK-ONLY: sesión interna simulada. No corresponde a ninguna tabla.
 */
export interface UsuarioAutenticado {
  Id: number;
  Nombre: string;
  Apellido: string;
  Email: string;
  Rol: RolMock;
  /** Presente solo cuando Rol === 'medico'. Referencia medicos.Id. */
  MedicoId?: number;
}
