import { useCallback, useEffect, useState } from 'react';

import type { TurnoConDetalles } from '@/models';
import { useAuth } from '@/controllers/useAuth';
import { mockApi } from '@/services/api';
import type { FechaISO, ID } from '@/types/common';
import { hoyISO } from '@/utils/fechas';

/**
 * CONTROLLER (MVC) — agenda diaria del médico logueado.
 * Requiere sesión con rol 'medico' (el guard lo garantiza).
 */
export interface AgendaMedicoEstado {
  medicoId: ID | null;
  fecha: FechaISO;
  turnos: TurnoConDetalles[];
  cargando: boolean;
  error: string | null;
  accionId: ID | null;

  setFecha(fecha: FechaISO): void;
  diaAnterior(): void;
  diaSiguiente(): void;
  irHoy(): void;
  completar(idTurno: ID): Promise<void>;
}

function sumarUnDia(iso: FechaISO, delta: number): FechaISO {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function useAgenda(): AgendaMedicoEstado {
  const { usuario } = useAuth();
  const medicoId = usuario?.MedicoId ?? null;

  const [fecha, setFecha] = useState<FechaISO>(hoyISO());
  const [turnos, setTurnos] = useState<TurnoConDetalles[]>([]);
  const [cargandoFetch, setCargandoFetch] = useState(true);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [accionId, setAccionId] = useState<ID | null>(null);

  // Estados derivados: evitan setState síncrono dentro del effect.
  const sinMedico = !medicoId;
  const error = sinMedico ? 'Tu usuario no está vinculado a un médico.' : errorFetch;
  const cargando = sinMedico ? false : cargandoFetch;

  useEffect(() => {
    if (!medicoId) return undefined;
    let vigente = true;
    void (async () => {
      setCargandoFetch(true);
      setErrorFetch(null);
      const r = await mockApi.getTurnosPorMedicoYFecha(medicoId, fecha);
      if (!vigente) return;
      if (r.ok) {
        setTurnos(r.data.filter((t) => t.Estado !== 'cancelado'));
      } else {
        setErrorFetch(r.error.mensaje);
        setTurnos([]);
      }
      setCargandoFetch(false);
    })();
    return () => {
      vigente = false;
    };
  }, [fecha, medicoId]);

  /** MOCK-ONLY (#2): la BD no persiste estados; se simula la escritura. */
  const completar = useCallback(
    async (idTurno: ID) => {
      setAccionId(idTurno);
      const r = await mockApi.completarTurno(idTurno);
      if (r.ok) {
        setTurnos((prev) => prev.map((t) => (t.Id === idTurno ? r.data : t)));
      } else {
        setErrorFetch(r.error.mensaje);
      }
      setAccionId(null);
    },
    [],
  );

  return {
    medicoId,
    fecha,
    turnos,
    cargando,
    error,
    accionId,
    setFecha,
    diaAnterior: () => setFecha(sumarUnDia(fecha, -1)),
    diaSiguiente: () => setFecha(sumarUnDia(fecha, 1)),
    irHoy: () => setFecha(hoyISO()),
    completar,
  };
}
