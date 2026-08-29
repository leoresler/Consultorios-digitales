import type { FechaISO, HoraHHMM, ID } from '@/types/common';

/**
 * Tabla `turnos` — espejo fiel del DDL.
 *
 * DISCREPANCIAS #1: no existe columna de hora (Fecha es DATE).
 * DISCREPANCIAS #2: no existe campo de estado persistente.
 * Ambas carencias se resuelven en `TurnoConDetalles` como MOCK-ONLY.
 */
export interface Turno {
  Id: ID;
  Id_Paciente: number;
  Id_Medico: number;
  /** Redundante por diseño de BD (derivable vía medico). Se respeta tal cual. */
  Id_Especialidad: number;
  /** Referencia a consultorios.Id. */
  Id_Clinica: number;
  /** DATE 'YYYY-MM-DD'. Sin componente horaria en la BD actual. */
  Fecha: FechaISO;
}

/**
 * MOCK-ONLY: la BD no modela estados de turno. Derivado client-side
 * hasta que el backend incorpore el campo real.
 */
export type EstadoTurno = 'confirmado' | 'pendiente' | 'cancelado' | 'completado';

/**
 * VIEW-MODEL para agenda y dashboard. Enriquece `Turno` con datos
 * resueltos por joins + campos MOCK-ONLY claramente marcados.
 */
export interface TurnoConDetalles extends Turno {
  /** MOCK-ONLY hasta existir columna de hora en BD. 'HH:mm'. */
  Hora: HoraHHMM;
  /** MOCK-ONLY hasta existir campo estado en BD. */
  Estado: EstadoTurno;
  /* --- Datos resueltos para UI (no son columnas) --- */
  PacienteNombreCompleto: string;
  /** Resuelto desde pacientes.Cobertura (texto libre #14) para la agenda. */
  PacienteCobertura?: string;
  MedicoNombreCompleto: string;
  EspecialidadNombre: string;
  ConsultorioNombre: string;
}

/**
 * VIEW-MODEL: slot calculado desde `dias_atencion`.
 * MOCK-ONLY: nunca se persiste; su disponibilidad final la valida el backend.
 */
export interface SlotDisponible {
  /** 'HH:mm'. */
  Hora: HoraHHMM;
  Disponible: boolean;
  /** DiaAtencion.Id que originó el slot. */
  IdDiaAtencion: number;
}

/** DTO de envío para confirmar turno (POST /turnos futuro). */
export interface ConfirmarTurnoDTO {
  Id_Paciente: number;
  Id_Medico: number;
  Id_Especialidad: number;
  Id_Clinica: number;
  Fecha: FechaISO;
  /** MOCK-ONLY hasta que la BD tenga columna de hora (#1). */
  Hora: HoraHHMM;
}

