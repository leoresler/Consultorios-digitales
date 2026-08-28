import type { FechaISO, ID } from '@/types/common';

/**
 * Tabla `historia_clinica` — espejo fiel del DDL.
 *
 * DISCREPANCIAS #3: toda fila exige IdTipoEstudio y no existen campos de
 * consulta libre (motivo/diagnóstico/tratamiento) → una atención clínica
 * común no es almacenable con el modelo actual.
 * DISCREPANCIAS #6: Documentos/Resultados están declarados SIN tipo en el
 * DDL; se asume texto hasta confirmación del backend.
 */
export interface HistoriaClinica {
  Id: ID;
  IdPaciente: number;
  IdMedico: number;
  IdTipoEstudio: number;
  /** PENDIENTE BD: columna sin tipo en DDL; asumido string|null. */
  Documentos?: string | null;
  Resultados?: string | null;
  /** DATE 'YYYY-MM-DD'. */
  FechaRealizacion: FechaISO;
}

/**
 * Tabla `documentos_clinicos` — espejo fiel del DDL.
 *
 * La columna `Id_estudio_clinico` referencia historia_clinica(Id)
 * (FK explícita en el DDL; nombre confuso pero resuelto).
 */
export interface DocumentoClinico {
  Id: ID;
  /** FK → historia_clinica.Id. */
  Id_estudio_clinico: number;
  /**
   * PENDIENTE BD: `Archivo FILE` no es un tipo PostgreSQL válido.
   * El front asume URL/path gestionado por el backend.
   */
  Archivo: string;
}

/** VIEW-MODEL para el timeline clínico. */
export interface EntradaTimeline extends HistoriaClinica {
  MedicoNombreCompleto: string;
  TipoEstudioNombre: string;
  Adjuntos: DocumentoClinico[];
  /** MOCK-ONLY: correlación heurística paciente+médico+fecha (#9). */
  RecetasRelacionadas: number[];
}

/** DTO de envío para "Nueva Atención" (solo campos existentes). */
export interface NuevaAtencionDTO {
  IdPaciente: number;
  IdMedico: number;
  IdTipoEstudio: number;
  Documentos?: string | null;
  Resultados?: string | null;
  FechaRealizacion: FechaISO;
}
