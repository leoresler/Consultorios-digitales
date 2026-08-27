import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import type {
  Consultorio,
  DiaAtencion,
  Especialidad,
  MedicoDetalle,
  PacienteDetalle,
  SlotDisponible,
  TurnoConDetalles,
} from '@/models';
import { mockApi } from '@/services/api';
import type { FechaISO, HoraHHMM, ID } from '@/types/common';
import {
  calcularSlots,
  diaSemanaDe,
  formatFechaLegible,
  hoyISO,
  sumarDias,
} from '@/utils/fechas';
import {
  guardarReservaPendiente,
  leerMarcadorRegistro,
  leerReservaPendiente,
  limpiarMarcadorRegistro,
  limpiarReservaPendiente,
} from '@/utils/reservaPendiente';

/**
 * CONTROLLER (MVC) — máquina de estados del flujo público de reserva:
 * especialidad → profesional → (consultorio) → fecha → horario →
 * documento → OTP (en página aparte) → confirmación.
 *
 * El cálculo de slots es client-side (UX); la validación definitiva
 * (concurrencia/doble reserva) SIEMPRE es del backend (#13).
 */

export type PasoReserva =
  | 'especialidad'
  | 'profesional'
  | 'consultorio'
  | 'fecha'
  | 'horario'
  | 'identificacion'
  | 'confirmacion'
  | 'exito';

const DIAS_ADELANTE = 14;

export interface ReservaEstado {
  paso: PasoReserva;
  /* Catálogos */
  especialidades: Especialidad[];
  cargandoCatalogo: boolean;
  /* Paso especialidad/profesional */
  especialidadId: ID | null;
  medicos: MedicoDetalle[];
  cargandoMedicos: boolean;
  medico: MedicoDetalle | null;
  /* Paso consultorio */
  consultorios: Consultorio[];
  consultorioId: ID | null;
  /* Paso fecha */
  diasAtencion: DiaAtencion[];
  fechasDisponibles: FechaISO[];
  fecha: FechaISO | null;
  /* Paso horario */
  slots: SlotDisponible[];
  cargandoSlots: boolean;
  hora: HoraHHMM | null;
  /* Identificación / nuevo paciente */
  paciente: PacienteDetalle | null;
  /* Confirmación */
  confirmando: boolean;
  error: string | null;
  conflictoHorario: boolean;
  pacienteNoEncontrado: boolean;
  turnoConfirmado: TurnoConDetalles | null;

  seleccionarEspecialidad(id: ID): Promise<void>;
  seleccionarMedico(id: ID): Promise<void>;
  elegirCualquierMedico(): Promise<void>;
  seleccionarConsultorio(id: ID): Promise<void>;
  seleccionarFecha(fecha: FechaISO): Promise<void>;
  reintentarSlots(): Promise<void>;
  seleccionarSlot(hora: HoraHHMM): void;
  identificarPaciente(tipoDocId: ID, numero: string): Promise<boolean>;
  irARegistro(tipoDocId: ID, numeroDocumento: string): void;
  confirmar(): Promise<void>;
  irAConflicto(): Promise<void>;
  volver(): void;
  reiniciar(): void;
}

function estadoInicial() {
  return {
    paso: 'especialidad' as PasoReserva,
    especialidadId: null as ID | null,
    medicos: [] as MedicoDetalle[],
    cargandoMedicos: false,
    medico: null as MedicoDetalle | null,
    consultorios: [] as Consultorio[],
    consultorioId: null as ID | null,
    diasAtencion: [] as DiaAtencion[],
    fechasDisponibles: [] as FechaISO[],
    fecha: null as FechaISO | null,
    slots: [] as SlotDisponible[],
    cargandoSlots: false,
    hora: null as HoraHHMM | null,
    paciente: null as PacienteDetalle | null,
    confirmando: false,
    error: null as string | null,
    conflictoHorario: false,
    pacienteNoEncontrado: false,
    turnoConfirmado: null as TurnoConDetalles | null,
  };
}

export function useReservaTurno(): ReservaEstado {
  const [estado, setEstado] = useState(estadoInicial);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);

  useEffect(() => {
    let vigente = true;
    mockApi.getEspecialidades().then((r) => {
      if (!vigente) return;
      if (r.ok) setEspecialidades(r.data);
      setCargandoCatalogo(false);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const patch = useCallback(
    (parcial: Partial<ReturnType<typeof estadoInicial>>) =>
      setEstado((prev) => ({ ...prev, ...parcial })),
    [],
  );

  /** Carga consultorios + días de atención del médico y deriva a 'fecha'. */
  const cargarAgendaMedico = useCallback(
    async (medico: MedicoDetalle) => {
      patch({ cargandoMedicos: true, medico, error: null });
      const [rCons, rDias] = await Promise.all([
        mockApi.getConsultoriosPorMedico(medico.Id),
        mockApi.getDiasAtencionPorMedico(medico.Id),
      ]);
      const consultorios = rCons.ok ? rCons.data : [];
      const dias = rDias.ok ? rDias.data : [];

      // Fechas con disponibilidad real según `dias_atencion` para el consultorio elegido.
      const derivarFechas = (idConsultorio: ID): FechaISO[] => {
        const hoy = hoyISO();
        const out: FechaISO[] = [];
        for (let i = 0; i < DIAS_ADELANTE; i++) {
          const f = sumarDias(hoy, i);
          const aplica = dias.some(
            (da) => da.Id_clinica === idConsultorio && da.Dia_Semana === diaSemanaDe(f),
          );
          if (aplica) out.push(f);
        }
        return out;
      };

      if (consultorios.length <= 1) {
        const idCons = consultorios[0]?.Id ?? null;
        patch({
          cargandoMedicos: false,
          consultorios,
          consultorioId: idCons,
          diasAtencion: dias,
          fechasDisponibles: idCons ? derivarFechas(idCons) : [],
          paso: 'fecha',
        });
      } else {
        patch({ cargandoMedicos: false, consultorios, diasAtencion: dias, paso: 'consultorio' });
      }
    },
    [patch],
  );

  const recalcularFechas = useCallback(
    (idConsultorio: ID, dias: DiaAtencion[]): FechaISO[] => {
      const hoy = hoyISO();
      const out: FechaISO[] = [];
      for (let i = 0; i < DIAS_ADELANTE; i++) {
        const f = sumarDias(hoy, i);
        if (dias.some((da) => da.Id_clinica === idConsultorio && da.Dia_Semana === diaSemanaDe(f))) {
          out.push(f);
        }
      }
      return out;
    },
    [],
  );

  const seleccionarEspecialidad = useCallback(
    async (id: ID) => {
      patch({ ...estadoInicial(), especialidadId: id, cargandoMedicos: true });
      setEspecialidades((prev) => prev); // catálogo ya está en memoria
      const r = await mockApi.getMedicosPorEspecialidad(id);
      if (r.ok && r.data.length > 0) {
        patch({ medicos: r.data, cargandoMedicos: false, paso: 'profesional' });
      } else if (r.ok) {
        patch({
          medicos: [],
          cargandoMedicos: false,
          paso: 'profesional',
          error: 'No hay profesionales disponibles para esta especialidad.',
        });
      } else {
        patch({ cargandoMedicos: false, paso: 'profesional', error: 'Error de red. Intentá de nuevo.' });
      }
    },
    [patch],
  );

  const seleccionarMedico = useCallback(
    async (id: ID) => {
      const m = estado.medicos.find((x) => x.Id === id);
      if (!m) return;
      await cargarAgendaMedico(m);
    },
    [estado.medicos, cargarAgendaMedico],
  );

  const elegirCualquierMedico = useCallback(async () => {
    const m = estado.medicos[0];
    if (m) await cargarAgendaMedico(m);
  }, [estado.medicos, cargarAgendaMedico]);

  const seleccionarConsultorio = useCallback(
    async (id: ID) => {
      patch({
        consultorioId: id,
        fechasDisponibles: recalcularFechas(id, estado.diasAtencion),
        paso: 'fecha',
      });
    },
    [estado.diasAtencion, patch, recalcularFechas],
  );

  const cargarSlots = useCallback(
    async (medicoId: ID, idConsultorio: ID, fecha: FechaISO) => {
      patch({ cargandoSlots: true, slots: [], error: null });
      const r = await mockApi.getTurnosPorMedicoYFecha(medicoId, fecha);
      const ocupadas = r.ok
        ? r.data.filter((t) => t.Estado !== 'cancelado').map((t) => t.Hora)
        : [];
      const franjas = estado.diasAtencion.filter(
        (da) => da.Id_clinica === idConsultorio && da.Dia_Semana === diaSemanaDe(fecha),
      );
      const vistos = new Set<string>();
      const slots = franjas
        .flatMap((da) => calcularSlots(da, ocupadas))
        .filter((s) => (vistos.has(s.Hora) ? false : (vistos.add(s.Hora), true)))
        .sort((a, b) => a.Hora.localeCompare(b.Hora));
      patch({ slots, cargandoSlots: false });
    },
    [estado.diasAtencion, patch],
  );

  const seleccionarFecha = useCallback(
    async (fecha: FechaISO) => {
      if (!estado.medico || !estado.consultorioId) return;
      patch({ fecha, hora: null, paso: 'horario' });
      await cargarSlots(estado.medico.Id, estado.consultorioId, fecha);
    },
    [cargarSlots, estado.consultorioId, estado.medico, patch],
  );

  const reintentarSlots = useCallback(async () => {
    if (estado.medico && estado.consultorioId && estado.fecha) {
      await cargarSlots(estado.medico.Id, estado.consultorioId, estado.fecha);
    }
  }, [cargarSlots, estado.consultorioId, estado.fecha, estado.medico]);

  const seleccionarSlot = useCallback(
    (hora: HoraHHMM) => patch({ hora, paso: 'identificacion' }),
    [patch],
  );

  const identificarPaciente = useCallback(
    async (tipoDocId: ID, numero: string): Promise<boolean> => {
      patch({ error: null, pacienteNoEncontrado: false });
      const r = await mockApi.getPacientePorDocumento(tipoDocId, numero);
      if (!r.ok) {
        patch({ error: 'Error de red. Intentá de nuevo.' });
        return false;
      }
      if (!r.data) {
        patch({
          error: 'No encontramos un paciente con ese documento. Podés registrarte a continuación.',
          pacienteNoEncontrado: true,
        });
        return false;
      }
      patch({ paciente: r.data, paso: 'confirmacion', error: null, pacienteNoEncontrado: false });
      return true;
    },
    [patch],
  );

  const irARegistro = useCallback(
    (tipoDocId: ID, numeroDocumento: string) => {
      guardarReservaPendiente({
        especialidadId: estado.especialidadId ?? 0,
        medico: estado.medico,
        consultorios: estado.consultorios,
        consultorioId: estado.consultorioId ?? 0,
        diasAtencion: estado.diasAtencion,
        fechasDisponibles: estado.fechasDisponibles,
        fecha: estado.fecha ?? '',
        slots: estado.slots,
        hora: estado.hora ?? '',
        tipoDocId,
        numeroDocumento: numeroDocumento.trim(),
      });
    },
    [estado],
  );

  // Si venimos de /registro (?registrado=1), restauramos la selección
  // guardada y reidentificamos al paciente para saltar a 'confirmacion'.
  const [searchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('registrado') !== '1') return;
    let vigente = true;
    void (async () => {
      const pendiente = leerReservaPendiente();
      const marca = leerMarcadorRegistro();
      if (!pendiente || !marca) return;
      setEstado((prev) => ({
        ...prev,
        especialidadId: pendiente.especialidadId,
        medico: pendiente.medico,
        consultorios: pendiente.consultorios,
        consultorioId: pendiente.consultorioId,
        diasAtencion: pendiente.diasAtencion,
        fechasDisponibles: pendiente.fechasDisponibles,
        fecha: pendiente.fecha,
        slots: pendiente.slots,
        hora: pendiente.hora,
        error: null,
        conflictoHorario: false,
        pacienteNoEncontrado: false,
      }));
      const r = await mockApi.getPacientePorDocumento(
        marca.tipoDocId,
        marca.numeroDocumento,
      );
      if (!vigente) return;
      if (r.ok && r.data) {
        setEstado((prev) => ({ ...prev, paciente: r.data, paso: 'confirmacion' }));
      } else {
        setEstado((prev) => ({ ...prev, paso: 'identificacion' }));
      }
    })();
    return () => {
      vigente = false;
    };
  }, [searchParams]);

  const confirmar = useCallback(async () => {
    const { medico, consultorioId, fecha, hora, paciente, especialidadId } = estado;
    if (!medico || !consultorioId || !fecha || !hora || !paciente || !especialidadId) return;
    patch({ confirmando: true, error: null, conflictoHorario: false });
    const r = await mockApi.confirmarTurno({
      Id_Paciente: paciente.Id,
      Id_Medico: medico.Id,
      Id_Especialidad: especialidadId,
      Id_Clinica: consultorioId,
      Fecha: fecha,
      Hora: hora,
    });
    patch({ confirmando: false });
    if (!r.ok) {
      const conflicto = r.error.codigo === 'SLOT_OCUPADO';
      patch({ error: r.error.mensaje, conflictoHorario: conflicto });
      return;
    }
    const consultorio = estado.consultorios.find((c) => c.Id === consultorioId);
    const detalle: TurnoConDetalles = {
      ...r.data,
      Hora: hora,
      Estado: 'confirmado',
      PacienteNombreCompleto: `${paciente.Nombre} ${paciente.Apellido}`,
      MedicoNombreCompleto: medico.NombreCompleto,
      EspecialidadNombre:
        especialidades.find((e) => e.Id === especialidadId)?.Nombre ?? '',
      ConsultorioNombre: consultorio?.Nombre ?? '',
    };
    patch({ turnoConfirmado: detalle, paso: 'exito' });
    limpiarReservaPendiente();
    limpiarMarcadorRegistro();
  }, [estado, especialidades, patch]);

  const irAConflicto = useCallback(async () => {
    patch({ conflictoHorario: false, error: null, paso: 'horario' });
    await reintentarSlots();
  }, [patch, reintentarSlots]);

  const volver = useCallback(() => {
    const destino: Partial<Record<PasoReserva, PasoReserva>> = {
      profesional: 'especialidad',
      consultorio: 'profesional',
      fecha: estado.consultorios.length > 1 ? 'consultorio' : 'profesional',
      horario: 'fecha',
      identificacion: 'horario',
      confirmacion: 'identificacion',
    };
    const d = destino[estado.paso];
    if (d) patch({ paso: d, error: null, conflictoHorario: false });
  }, [estado.consultorios.length, estado.paso, patch]);

  const reiniciar = useCallback(() => {
    limpiarReservaPendiente();
    limpiarMarcadorRegistro();
    setEstado(estadoInicial());
  }, []);

  return useMemo(
    () => ({
      ...estado,
      especialidades,
      cargandoCatalogo,
      seleccionarEspecialidad,
      seleccionarMedico,
      elegirCualquierMedico,
      seleccionarConsultorio,
      seleccionarFecha,
      reintentarSlots,
      seleccionarSlot,
      identificarPaciente,
      irARegistro,
      confirmar,
      irAConflicto,
      volver,
      reiniciar,
    }),
    [
      estado,
      especialidades,
      cargandoCatalogo,
      seleccionarEspecialidad,
      seleccionarMedico,
      elegirCualquierMedico,
      seleccionarConsultorio,
      seleccionarFecha,
      reintentarSlots,
      seleccionarSlot,
      identificarPaciente,
      irARegistro,
      confirmar,
      irAConflicto,
      volver,
      reiniciar,
    ],
  );
}

/** Resumen legible de fecha/hora para tarjetas de confirmación y éxito. */
export function resumenCuando(fecha: FechaISO | null, hora: HoraHHMM | null): string {
  if (!fecha) return '';
  return `${formatFechaLegible(fecha)}${hora ? ` · ${hora} hs` : ''}`;
}
