import type {
  Consultorio,
  DiaAtencion,
  MedicoDetalle,
  SlotDisponible,
} from '@/models';
import type { FechaISO, HoraHHMM, ID } from '@/types/common';

/**
 * Persistencia temporal (sessionStorage) del estado del wizard de reserva.
 * Sirve para que el alta de un paciente nuevo ocurra en /registro (página
 * aparte) y el usuario vuelva a la reserva sin perder lo ya elegido.
 */

export const KEY_RESERVA_PENDIENTE = 'clinica.reserva.pendiente.v1';
export const KEY_REGISTRO_COMPLETO = 'clinica.reserva.registrado.v1';

export interface SnapshotReserva {
  especialidadId: ID;
  medico: MedicoDetalle | null;
  consultorios: Consultorio[];
  consultorioId: ID;
  diasAtencion: DiaAtencion[];
  fechasDisponibles: FechaISO[];
  fecha: FechaISO;
  slots: SlotDisponible[];
  hora: HoraHHMM;
  tipoDocId: ID;
  numeroDocumento: string;
}

export interface MarcadorRegistro {
  tipoDocId: ID;
  numeroDocumento: string;
}

export function guardarReservaPendiente(snap: SnapshotReserva): void {
  sessionStorage.setItem(KEY_RESERVA_PENDIENTE, JSON.stringify(snap));
}

export function leerReservaPendiente(): SnapshotReserva | null {
  const raw = sessionStorage.getItem(KEY_RESERVA_PENDIENTE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SnapshotReserva;
  } catch {
    return null;
  }
}

export function limpiarReservaPendiente(): void {
  sessionStorage.removeItem(KEY_RESERVA_PENDIENTE);
}

export function guardarMarcadorRegistro(marca: MarcadorRegistro): void {
  sessionStorage.setItem(KEY_REGISTRO_COMPLETO, JSON.stringify(marca));
}

export function leerMarcadorRegistro(): MarcadorRegistro | null {
  const raw = sessionStorage.getItem(KEY_REGISTRO_COMPLETO);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MarcadorRegistro;
  } catch {
    return null;
  }
}

export function limpiarMarcadorRegistro(): void {
  sessionStorage.removeItem(KEY_REGISTRO_COMPLETO);
}