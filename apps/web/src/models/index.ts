// Barrel de modelos — punto único de importación para views/controllers.
// Las tablas [BD] se exportan tal cual; los VIEW-MODEL/DTO están agrupados junto a su dominio.

export type { Genero } from './Genero';
export type { Paciente, PacienteDetalle } from './Paciente';
export type {
  Usuario,
  RolMock,
  UsuarioAutenticado,
} from './Usuario';
export type { Especialidad } from './Especialidad';
export type { Medico, MedicoDetalle } from './Medico';
export type { Consultorio, ConsultorioMedico } from './Consultorio';
export type {
  DiaSemana,
  DiaAtencion,
  RangoHorarioUI,
} from './DiaAtencion';
export type {
  TipoDocumento,
  PacienteDocumento,
  IdentificacionPaciente,
  DatosMinimosPaciente,
  OtpVerificacion,
} from './Documento';
export type {
  Turno,
  EstadoTurno,
  TurnoConDetalles,
  SlotDisponible,
  ConfirmarTurnoDTO,
} from './Turno';
export type { Medicamento, TipoEstudio } from './Catalogos';
export type {
  Receta,
  RecetaDetalle,
  CrearRecetaDTO,
} from './Receta';
export type {
  HistoriaClinica,
  DocumentoClinico,
  EntradaTimeline,
  NuevaAtencionDTO,
} from './HistoriaClinica';
