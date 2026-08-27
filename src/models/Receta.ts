import type { FechaISO } from '@/types/common';

/**
 * Tabla `recetas` — espejo fiel del DDL.
 *
 * DISCREPANCIAS #7: Dosis/Frecuencia son INT sin unidad; `Indicada` es la
 * fecha en que fue indicada (no hay campo de texto de indicación).
 * DISCREPANCIAS #9: sin FK a atención/historia — la relación con atenciones
 * es heurística (paciente+médico+fecha).
 */
export interface Receta {
  Id: number;
  IdPaciente: number;
  IdMedico: number;
  /** Referencia a medicamentos.Id (columna llamada IdMedicacion). */
  IdMedicacion: number;
  /** PENDIENTE BD: INT sin unidad (¿mg, ml, comprimidos?). */
  Dosis: number;
  /** PENDIENTE BD: INT sin unidad (¿cada cuántas horas?). */
  Frecuencia: number;
  /** DATE 'YYYY-MM-DD': fecha de indicación. */
  Indicada: FechaISO;
  /** DATE 'YYYY-MM-DD': vencimiento. */
  Vigencia: FechaISO;
}

/** VIEW-MODEL con nombres resueltos para UI. */
export interface RecetaDetalle extends Receta {
  PacienteNombreCompleto: string;
  MedicoNombreCompleto: string;
  MedicamentoNombre: string;
}

/** DTO de envío para crear receta (POST /recetas futuro). */
export interface CrearRecetaDTO
  extends Omit<Receta, 'Id'> {}
