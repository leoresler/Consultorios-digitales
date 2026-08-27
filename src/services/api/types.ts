import type {
  ConfirmarTurnoDTO,
  Consultorio,
  CrearRecetaDTO,
  DatosMinimosPaciente,
  DiaAtencion,
  EntradaTimeline,
  Especialidad,
  Genero,
  HistoriaClinica,
  Medicamento,
  MedicoDetalle,
  NuevaAtencionDTO,
  PacienteDetalle,
  RecetaDetalle,
  TipoDocumento,
  TipoEstudio,
  Turno,
  TurnoConDetalles,
  UsuarioAutenticado,
} from '@/models';
import type { HoraHHMM, FechaISO, ID, Result } from '@/types/common';

export type { Result };

/**
 * CONTRATO ÚNICO entre controllers/hooks y el origen de datos.
 *
 * Hoy lo implementa `mockApi`. Mañana lo implementará `httpClient`
 * contra NestJS SIN modificar Views ni Hooks.
 *
 * Toda operación de escritura es responsabilidad final del backend:
 * transacciones, concurrencia y doble-reserva NO viven aquí.
 */
export interface IApiService {
  /* ---------- Autenticación interna ---------- */
  login(Email: string, Contrasena: string): Promise<Result<UsuarioAutenticado>>;

  /* ---------- Catálogos ---------- */
  getEspecialidades(): Promise<Result<Especialidad[]>>;
  /**
   * PENDIENTE BD: el DDL no define un endpoint de listado global de médicos;
   * el mock compone `medicos` + `usuarios` + `especialidades`.
   */
  getMedicos(): Promise<Result<MedicoDetalle[]>>;
  getMedicosPorEspecialidad(Id_Especialidad: ID): Promise<Result<MedicoDetalle[]>>;
  getMedicamentos(): Promise<Result<Medicamento[]>>;
  getTiposEstudio(): Promise<Result<TipoEstudio[]>>;
  getTiposDocumento(): Promise<Result<TipoDocumento[]>>;
  getGeneros(): Promise<Result<Genero[]>>;
  /** Junction consultorios_medicos resuelta server-side. */
  getConsultoriosPorMedico(Id_medico: ID): Promise<Result<Consultorio[]>>;

  /* ---------- Disponibilidad (lectura) ---------- */
  getDiasAtencionPorMedico(Id_medico: ID): Promise<Result<DiaAtencion[]>>;
  /**
   * Ocupación real por médico+fecha. El cálculo de slots ocurre client-side
   * (utils/slotCalculator); la validación definitiva es del backend.
   */
  getTurnosPorMedicoYFecha(Id_Medico: ID, Fecha: FechaISO): Promise<Result<TurnoConDetalles[]>>;

  /* ---------- Turnos ---------- */
  getTurnosPorPaciente(Id_Paciente: ID): Promise<Result<TurnoConDetalles[]>>;
  confirmarTurno(dto: ConfirmarTurnoDTO): Promise<Result<Turno>>;
  /** MOCK-ONLY: sin campo estado en BD (#2); simula la escritura. */
  cancelarTurno(Id_Turno: ID): Promise<Result<TurnoConDetalles>>;
  /** MOCK-ONLY (#2): marca el turno como atendido/completado. */
  completarTurno(Id_Turno: ID): Promise<Result<TurnoConDetalles>>;

  /* ---------- Pacientes (flujo público + recepción) ---------- */
  getPacientePorDocumento(TipoDocumentoId: ID, Numero: string): Promise<Result<PacienteDetalle | null>>;
  registrarPaciente(datos: DatosMinimosPaciente): Promise<Result<PacienteDetalle>>;
  /**
   * PENDIENTE BD: no existe GET /pacientes (mismo pendiente que
   * GET /pacientes/:id usado por historia clínica). El mock lo compone.
   */
  getPacientes(): Promise<Result<PacienteDetalle[]>>;

  /* ---------- Historia clínica ---------- */
  getHistoriaPorPaciente(IdPaciente: ID): Promise<Result<EntradaTimeline[]>>;
  crearAtencion(dto: NuevaAtencionDTO): Promise<Result<HistoriaClinica>>;

  /* ---------- Recetas ---------- */
  getRecetasPorPaciente(IdPaciente: ID): Promise<Result<RecetaDetalle[]>>;
  crearReceta(dto: CrearRecetaDTO): Promise<Result<RecetaDetalle>>;

  /* ---------- OTP MOCK-ONLY (#8): la BD no modela teléfonos ni tokens ---------- */
  enviarOtp(destino: string): Promise<Result<{ destino: string }>>;
  verificarOtp(destino: string, codigo: string): Promise<Result<boolean>>;
}

/** Utilidad de latencia simulada para el mock. */
export const esperar = (ms = 350): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Helper interno del mock para construir errores homogéneos. */
export const errorApi = (codigo: string, mensaje: string): { ok: false; error: { codigo: string; mensaje: string } } => ({
  ok: false,
  error: { codigo, mensaje },
});

/** Normaliza 'YYYY-MM-DDTHH:mm...' → 'HH:mm'. */
export const extraerHora = (iso: string): HoraHHMM => iso.slice(11, 16);
