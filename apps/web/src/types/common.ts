/**
 * Tipos transversales del proyecto.
 */

/** Todo identificador de la BD es INT. */
export type ID = number;

/**
 * Convención de fechas en el contrato frontend:
 * - Columnas DATE     → string ISO 'YYYY-MM-DD'
 * - Columnas DATETIME → string ISO 8601 completo
 */
export type FechaISO = string;
export type FechaHoraISO = string;

/** Hora local 'HH:mm' (24h). Usada por slots y turnos. */
export type HoraHHMM = string;

export interface ApiError {
  /** Código estable para mapear a mensajes de UI: 'SLOT_OCUPADO', 'RED', 'OTP_INVALIDO', etc. */
  codigo: string;
  mensaje: string;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };
