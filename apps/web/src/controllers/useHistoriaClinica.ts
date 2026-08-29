import { useCallback, useEffect, useState } from 'react';

import type { EntradaTimeline, NuevaAtencionDTO, PacienteDetalle } from '@/models';
import { mockApi } from '@/services/api';
import type { ID } from '@/types/common';

/**
 * CONTROLLER (MVC) — historia clínica del paciente:
 * timeline de estudios/atenciones + alta "Nueva Atención".
 *
 * DISCREPANCIAS #3: sin motivo/diagnóstico en BD; toda entrada es un
 * estudio con IdTipoEstudio obligatorio. La UI lo explicita.
 */
export interface HistoriaClinicaEstado {
  paciente: PacienteDetalle | null;
  entradas: EntradaTimeline[];
  cargando: boolean;
  error: string | null;
  guardando: boolean;
  errorGuardado: string | null;

  crearAtencion(dto: Omit<NuevaAtencionDTO, 'IdPaciente' | 'IdMedico'>): Promise<boolean>;
}

export function useHistoriaClinica(idPaciente: ID | null, medicoId: ID | null): HistoriaClinicaEstado {
  const [paciente, setPaciente] = useState<PacienteDetalle | null>(null);
  const [entradas, setEntradas] = useState<EntradaTimeline[]>([]);
  const [cargandoFetch, setCargandoFetch] = useState(true);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  // Estados derivados: evitan setState síncrono dentro del effect.
  const sinPaciente = !idPaciente;
  const error = sinPaciente ? 'Falta el identificador del paciente.' : errorFetch;
  const cargando = sinPaciente ? false : cargandoFetch;

  useEffect(() => {
    if (!idPaciente) return undefined;
    let vigente = true;

    void (async () => {
      setCargandoFetch(true);
      setErrorFetch(null);

      // Paciente para el encabezado: se resuelve vía sus turnos (mock) —
      // PENDIENTE BD: no existe GET /pacientes/:id en el contrato actual.
      const rTurnos = await mockApi.getTurnosPorPaciente(idPaciente);
      if (rTurnos.ok && rTurnos.data.length > 0) {
        const t = rTurnos.data[0];
        setPaciente({
          Id: t.Id_Paciente,
          Id_usuario: null,
          Cobertura: t.PacienteCobertura ?? '',
          Nombre: t.PacienteNombreCompleto.split(' ')[0] ?? '',
          Apellido: t.PacienteNombreCompleto.split(' ').slice(1).join(' '),
          Email: '',
          Fecha_Nacimiento: '',
        });
      }

      const rHistoria = await mockApi.getHistoriaPorPaciente(idPaciente);
      if (!vigente) return;
      if (rHistoria.ok) setEntradas(rHistoria.data);
      else setErrorFetch(rHistoria.error.mensaje);
      setCargandoFetch(false);
    })();

    return () => {
      vigente = false;
    };
  }, [idPaciente]);

  const crearAtencion = useCallback(
    async (dto: Omit<NuevaAtencionDTO, 'IdPaciente' | 'IdMedico'>): Promise<boolean> => {
      if (!idPaciente || !medicoId) return false;
      setGuardando(true);
      setErrorGuardado(null);
      const r = await mockApi.crearAtencion({ ...dto, IdPaciente: idPaciente, IdMedico: medicoId });
      setGuardando(false);
      if (!r.ok) {
        setErrorGuardado(r.error.mensaje);
        return false;
      }
      // Recarga el timeline para incluir adjuntos/recetas correlacionadas.
      const rHist = await mockApi.getHistoriaPorPaciente(idPaciente);
      if (rHist.ok) setEntradas(rHist.data);
      return true;
    },
    [idPaciente, medicoId],
  );

  return {
    paciente,
    entradas,
    cargando,
    error,
    guardando,
    errorGuardado,
    crearAtencion,
  };
}
