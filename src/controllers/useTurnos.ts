import { useCallback, useState } from 'react';

import type { PacienteDetalle, TurnoConDetalles } from '@/models';
import { mockApi } from '@/services/api';
import type { ID } from '@/types/common';

/**
 * CONTROLLER (MVC) — portal público del paciente:
 * identificación por documento + consulta y cancelación de turnos.
 * Sin cuentas de paciente (#4): la identidad es el documento
 * (`usuarios_documento.Documento`).
 */
export interface PortalPacienteEstado {
  paciente: PacienteDetalle | null;
  identificando: boolean;
  errorIdentificacion: string | null;
  turnos: TurnoConDetalles[];
  cargandoTurnos: boolean;
  errorTurnos: string | null;
  cancelandoId: ID | null;

  identificar(tipoDocId: ID, numero: string): Promise<boolean>;
  salir(): void;
  cancelar(idTurno: ID): Promise<void>;
}

export function useTurnos(): PortalPacienteEstado {
  const [paciente, setPaciente] = useState<PacienteDetalle | null>(null);
  const [identificando, setIdentificando] = useState(false);
  const [errorIdentificacion, setErrorIdentificacion] = useState<string | null>(null);
  const [turnos, setTurnos] = useState<TurnoConDetalles[]>([]);
  const [cargandoTurnos, setCargandoTurnos] = useState(false);
  const [errorTurnos, setErrorTurnos] = useState<string | null>(null);
  const [cancelandoId, setCancelandoId] = useState<ID | null>(null);

  const cargarTurnos = useCallback(async (idPaciente: ID) => {
    setCargandoTurnos(true);
    setErrorTurnos(null);
    const r = await mockApi.getTurnosPorPaciente(idPaciente);
    if (r.ok) {
      setTurnos(r.data);
    } else {
      setErrorTurnos(r.error.mensaje);
    }
    setCargandoTurnos(false);
  }, []);

  const identificar = useCallback(
    async (tipoDocId: ID, numero: string): Promise<boolean> => {
      setIdentificando(true);
      setErrorIdentificacion(null);
      const r = await mockApi.getPacientePorDocumento(tipoDocId, numero);
      setIdentificando(false);
      if (!r.ok) {
        setErrorIdentificacion('Error de red. Intentá de nuevo.');
        return false;
      }
      if (!r.data) {
        setErrorIdentificacion('No encontramos un paciente con ese documento.');
        return false;
      }
      setPaciente(r.data);
      await cargarTurnos(r.data.Id);
      return true;
    },
    [cargarTurnos],
  );

  const salir = useCallback(() => {
    setPaciente(null);
    setTurnos([]);
    setErrorIdentificacion(null);
  }, []);

  /** MOCK-ONLY (#2): la BD no persiste estado; se simula la escritura. */
  const cancelar = useCallback(
    async (idTurno: ID) => {
      setCancelandoId(idTurno);
      await mockApi.cancelarTurno(idTurno);
      if (paciente) await cargarTurnos(paciente.Id);
      setCancelandoId(null);
    },
    [cargarTurnos, paciente],
  );

  return {
    paciente,
    identificando,
    errorIdentificacion,
    turnos,
    cargandoTurnos,
    errorTurnos,
    cancelandoId,
    identificar,
    salir,
    cancelar,
  };
}
