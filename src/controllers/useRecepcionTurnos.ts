import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  Consultorio,
  DiaAtencion,
  MedicoDetalle,
  PacienteDetalle,
  TipoDocumento,
  TurnoConDetalles,
} from '@/models';
import { mockApi } from '@/services/api';
import type { FechaISO, HoraHHMM, ID } from '@/types/common';
import { calcularSlots, diaSemanaDe, hoyISO } from '@/utils/fechas';

/**
 * CONTROLLER (MVC) — recepción: agenda por profesional+fecha con
 * cancelación y asignación rápida de turnos para pacientes identificados
 * por documento.
 *
 * El cálculo de slots es client-side (UX); la validación definitiva
 * (concurrencia / SLOT_OCUPADO) SIEMPRE es del backend.
 */

/** Horas libres del día según `dias_atencion` − ocupación real, sin duplicados. */
function slotsLibresDe(
  dias: DiaAtencion[],
  idConsultorio: ID,
  fecha: FechaISO,
  ocupadas: string[],
): HoraHHMM[] {
  const franjas = dias.filter(
    (da) => da.Id_clinica === idConsultorio && da.Dia_Semana === diaSemanaDe(fecha),
  );
  const vistas = new Set<string>();
  return franjas
    .flatMap((da) => calcularSlots(da, ocupadas))
    .filter((s) => s.Disponible)
    .filter((s) => (vistas.has(s.Hora) ? false : (vistas.add(s.Hora), true)))
    .map((s) => s.Hora)
    .sort((a, b) => a.localeCompare(b));
}

type SnapshotAgenda =
  | { ok: true; turnos: TurnoConDetalles[]; horasLibres: HoraHHMM[] }
  | { ok: false; mensaje: string };

/** Agenda del día + horas libres para un profesional/consultorio/fecha. */
async function obtenerSnapshot(
  medicoId: ID,
  consultorioId: ID,
  fecha: FechaISO,
  dias: DiaAtencion[],
): Promise<SnapshotAgenda> {
  const r = await mockApi.getTurnosPorMedicoYFecha(medicoId, fecha);
  if (!r.ok) return { ok: false, mensaje: r.error.mensaje };
  const activos = r.data.filter((t) => t.Estado !== 'cancelado');
  return {
    ok: true,
    turnos: activos,
    horasLibres: slotsLibresDe(
      dias,
      consultorioId,
      fecha,
      activos.map((t) => t.Hora),
    ),
  };
}

export interface RecepcionTurnosEstado {  /* Selección de profesional */
  medicos: MedicoDetalle[];
  cargandoMedicos: boolean;
  medicoId: ID | null;

  /* Agenda del día */
  consultorios: Consultorio[];
  consultorioId: ID | null;
  fecha: FechaISO;
  turnos: TurnoConDetalles[];
  cargandoAgenda: boolean;
  errorAgenda: string | null;
  /** false = el profesional no tiene franjas cargadas ese día. */
  atiendeHoy: boolean;

  /* Asignación rápida */
  tiposDocumento: TipoDocumento[];
  horasLibres: HoraHHMM[];
  horaElegida: HoraHHMM | null;
  identificando: boolean;
  errorIdentificacion: string | null;
  pacienteReserva: PacienteDetalle | null;
  confirmando: boolean;
  errorConfirmar: string | null;
  reservado: TurnoConDetalles | null;

  /* Cancelación desde la agenda */
  cancelandoId: ID | null;

  elegirMedico(id: ID | null): Promise<void>;
  elegirConsultorio(id: ID | null): void;
  setFecha(fecha: FechaISO): void;
  diaAnterior(): void;
  diaSiguiente(): void;
  irHoy(): void;

  /** null = deselecciona el horario elegido. */
  elegirHora(hora: HoraHHMM | null): void;
  identificarPaciente(tipoDocId: ID, numero: string): Promise<boolean>;
  limpiarPacienteReserva(): void;
  confirmarReserva(): Promise<void>;
  cerrarExito(): void;

  cancelar(idTurno: ID): Promise<void>;
}

function sumarUnDia(iso: FechaISO, delta: number): FechaISO {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + delta);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function useRecepcionTurnos(): RecepcionTurnosEstado {
  const [medicos, setMedicos] = useState<MedicoDetalle[]>([]);
  const [cargandoMedicos, setCargandoMedicos] = useState(true);
  const [medicoId, setMedicoId] = useState<ID | null>(null);

  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [consultorioId, setConsultorioId] = useState<ID | null>(null);
  const [diasAtencion, setDiasAtencion] = useState<DiaAtencion[]>([]);

  const [fecha, setFechaState] = useState<FechaISO>(hoyISO());
  const [turnos, setTurnos] = useState<TurnoConDetalles[]>([]);
  const [cargandoAgenda, setCargandoAgenda] = useState(false);
  const [errorAgenda, setErrorAgenda] = useState<string | null>(null);

  const [horasLibres, setHorasLibres] = useState<HoraHHMM[]>([]);
  const [horaElegida, setHoraElegida] = useState<HoraHHMM | null>(null);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [identificando, setIdentificando] = useState(false);
  const [errorIdentificacion, setErrorIdentificacion] = useState<string | null>(null);
  const [pacienteReserva, setPacienteReserva] = useState<PacienteDetalle | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [errorConfirmar, setErrorConfirmar] = useState<string | null>(null);
  const [reservado, setReservado] = useState<TurnoConDetalles | null>(null);

  const [cancelandoId, setCancelandoId] = useState<ID | null>(null);

  useEffect(() => {
    let vigente = true;
    void (async () => {
      const [rMed, rDoc] = await Promise.all([
        mockApi.getMedicos(),
        mockApi.getTiposDocumento(),
      ]);
      if (!vigente) return;
      if (rMed.ok) setMedicos(rMed.data);
      if (rDoc.ok) setTiposDocumento(rDoc.data);
      setCargandoMedicos(false);
    })();
    return () => {
      vigente = false;
    };
  }, []);

  /** Recarga la agenda del profesional/fecha activos (uso desde handlers). */
  const recargarAgenda = useCallback(async () => {
    if (!medicoId || !consultorioId) return;
    setCargandoAgenda(true);
    setErrorAgenda(null);
    const snap = await obtenerSnapshot(medicoId, consultorioId, fecha, diasAtencion);
    if (snap.ok) {
      setTurnos(snap.turnos);
      setHorasLibres(snap.horasLibres);
    } else {
      setTurnos([]);
      setHorasLibres([]);
      setErrorAgenda(snap.mensaje);
    }
    setCargandoAgenda(false);
  }, [consultorioId, diasAtencion, fecha, medicoId]);

  useEffect(() => {
    if (!medicoId || !consultorioId) return undefined;
    let vigente = true;
    void (async () => {
      setCargandoAgenda(true);
      setErrorAgenda(null);
      const snap = await obtenerSnapshot(medicoId, consultorioId, fecha, diasAtencion);
      if (!vigente) return;
      if (snap.ok) {
        setTurnos(snap.turnos);
        setHorasLibres(snap.horasLibres);
      } else {
        setTurnos([]);
        setHorasLibres([]);
        setErrorAgenda(snap.mensaje);
      }
      setCargandoAgenda(false);
    })();
    return () => {
      vigente = false;
    };
  }, [consultorioId, diasAtencion, fecha, medicoId]);

  const reiniciarReserva = useCallback(() => {
    setHoraElegida(null);
    setPacienteReserva(null);
    setErrorIdentificacion(null);
    setErrorConfirmar(null);
    setReservado(null);
  }, []);

  const elegirMedico = useCallback(
    async (id: ID | null) => {
      reiniciarReserva();
      setMedicoId(id);
      setConsultorios([]);
      setConsultorioId(null);
      setDiasAtencion([]);
      setTurnos([]);
      setHorasLibres([]);
      setErrorAgenda(null);
      if (!id) return;
      const [rCons, rDias] = await Promise.all([
        mockApi.getConsultoriosPorMedico(id),
        mockApi.getDiasAtencionPorMedico(id),
      ]);
      const cons = rCons.ok ? rCons.data : [];
      const dias = rDias.ok ? rDias.data : [];
      setConsultorios(cons);
      setDiasAtencion(dias);
      // Junction consultorios_medicos: auto-elegir si hay un único consultorio.
      setConsultorioId(cons.length === 1 ? cons[0].Id : null);
    },
    [reiniciarReserva],
  );

  const elegirConsultorio = useCallback(
    (id: ID | null) => {
      reiniciarReserva();
      setConsultorioId(id);
    },
    [reiniciarReserva],
  );

  const setFecha = useCallback(
    (f: FechaISO) => {
      reiniciarReserva();
      setFechaState(f);
    },
    [reiniciarReserva],
  );

  const atiendeHoy = useMemo(() => {
    if (!consultorioId) return true; // aún sin consultorio elegido: no afirmar nada
    return diasAtencion.some(
      (da) =>
        da.Id_clinica === consultorioId &&
        da.Dia_Semana === diaSemanaDe(fecha),
    );
  }, [consultorioId, diasAtencion, fecha]);

  const identificarPaciente = useCallback(
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
        setErrorIdentificacion(
          'No existe un paciente con ese documento. Registrate en la sección Pacientes.',
        );
        return false;
      }
      setPacienteReserva(r.data);
      return true;
    },
    [],
  );

  const confirmarReserva = useCallback(async () => {
    const medico = medicos.find((m) => m.Id === medicoId);
    if (!medico || !consultorioId || !horaElegida || !pacienteReserva) return;
    setConfirmando(true);
    setErrorConfirmar(null);
    const r = await mockApi.confirmarTurno({
      Id_Paciente: pacienteReserva.Id,
      Id_Medico: medico.Id,
      Id_Especialidad: medico.Id_Especialidad,
      Id_Clinica: consultorioId,
      Fecha: fecha,
      Hora: horaElegida,
    });
    setConfirmando(false);
    if (!r.ok) {
      setErrorConfirmar(r.error.mensaje);
      if (r.error.codigo === 'SLOT_OCUPADO') {
        // El horario quedó tomado: soltar la selección y refrescar.
        setHoraElegida(null);
        await recargarAgenda();
      }
      return;
    }
    const consultorio = consultorios.find((c) => c.Id === consultorioId);
    setReservado({
      ...r.data,
      Hora: horaElegida,
      Estado: 'confirmado',
      PacienteNombreCompleto: `${pacienteReserva.Nombre} ${pacienteReserva.Apellido}`,
      PacienteCobertura: pacienteReserva.Cobertura,
      MedicoNombreCompleto: medico.NombreCompleto,
      EspecialidadNombre: medico.EspecialidadNombre,
      ConsultorioNombre: consultorio?.Nombre ?? '',
    });
    reiniciarReserva();
    await recargarAgenda();
  }, [
    consultorioId,
    consultorios,
    recargarAgenda,
    fecha,
    horaElegida,
    medicos,
    medicoId,
    pacienteReserva,
    reiniciarReserva,
  ]);

  /** MOCK-ONLY (#2): la BD no persiste estados; se simula la escritura. */
  const cancelar = useCallback(
    async (idTurno: ID) => {
      setCancelandoId(idTurno);
      const r = await mockApi.cancelarTurno(idTurno);
      if (r.ok) await recargarAgenda();
      setCancelandoId(null);
    },
    [recargarAgenda],
  );

  return {
    medicos,
    cargandoMedicos,
    medicoId,
    consultorios,
    consultorioId,
    fecha,
    turnos,
    cargandoAgenda,
    errorAgenda,
    atiendeHoy,
    tiposDocumento,
    horasLibres,
    horaElegida,
    identificando,
    errorIdentificacion,
    pacienteReserva,
    confirmando,
    errorConfirmar,
    reservado,
    cancelandoId,

    elegirMedico,
    elegirConsultorio,
    setFecha,
    diaAnterior: () => setFecha(sumarUnDia(fecha, -1)),
    diaSiguiente: () => setFecha(sumarUnDia(fecha, 1)),
    irHoy: () => setFecha(hoyISO()),

    elegirHora: (hora) => {
      setErrorConfirmar(null);
      setHoraElegida(hora);
    },
    identificarPaciente,
    limpiarPacienteReserva: reiniciarReserva,
    confirmarReserva,
    cerrarExito: () => setReservado(null),

    cancelar,
  };
}
