import type { Especialidad } from './Especialidad';
import type { Usuario } from './Usuario';

/**
 * Tabla `medicos` — espejo fiel del DDL.
 * DISCREPANCIAS #15: una sola especialidad por médico (FK única).
 */
export interface Medico {
  Id: number;
  Id_usuario: number;
  Id_Especialidad: number;
}

/**
 * VIEW-MODEL (composición `medicos` + `usuarios` + `especialidades`).
 */
export interface MedicoDetalle extends Medico {
  NombreCompleto: string;
  EspecialidadNombre: Especialidad['Nombre'];
  /** Datos del usuario subyacente cuando están disponibles. */
  Usuario?: Pick<Usuario, 'Email' | 'Fecha_Nacimiento'>;
}
