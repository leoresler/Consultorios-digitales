import type { ID } from '@/types/common';

/**
 * Tabla `pacientes` — espejo fiel del DDL.
 */
export interface Paciente {
  Id: ID;
  /** Null = paciente identificado por documento pero sin cuenta de portal. */
  Id_usuario: number | null;
  /** Texto libre según DDL (sin catálogo de obras sociales). Ver DISCREPANCIAS #14. */
  Cobertura: string;
}

/**
 * VIEW-MODEL (composición de `pacientes` + `usuarios`).
 * No es una tabla: la construyen los services/hooks para la UI.
 */
export interface PacienteDetalle extends Paciente {
  Nombre: string;
  Apellido: string;
  Email: string;
  Fecha_Nacimiento: string;
  /**
   * Junction `usuarios_documento` resuelta server-side.
   * Opcionales: un paciente sin documento cargado no se puede identificar.
   */
  TipoDocumentoId?: number;
  NumeroDocumento?: string;
}
