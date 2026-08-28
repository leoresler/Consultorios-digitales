import {
  consultoriosMedicosMock,
  consultoriosMock,
  credencialesMock,
  documentosClinicosMock,
  especialidadesMock,
  generosMock,
  historiaClinicaMock,
  medicamentosMock,
  medicosMock,
  pacientesDocumentosMock,
  pacientesMock,
  recetasMock,
  tiposDocumentoMock,
  tiposEstudioMock,
  turnosExtrasMock,
  turnosMock,
  usuariosMock,
} from '@/mocks';
import { diasAtencionMock } from '@/mocks/diasAtencion';
import type {
  ConfirmarTurnoDTO,
  CrearRecetaDTO,
  DatosMinimosPaciente,
  DiaAtencion,
  EntradaTimeline,
  EstadoTurno,
  HistoriaClinica,
  Medicamento,
  MedicoDetalle,
  NuevaAtencionDTO,
  PacienteDetalle,
  RecetaDetalle,
  TipoEstudio,
  Turno,
  TurnoConDetalles,
  UsuarioAutenticado,
} from '@/models';
import type { IApiService, Result } from './types';
import { errorApi, esperar } from './types';

/* ------------------------------------------------------------------ */
/* Helpers internos del mock                                           */
/* ------------------------------------------------------------------ */

const usuarioPorId = (id: number | null) =>
  id === null ? undefined : usuariosMock.find((u) => u.Id === id);
const nombreCompleto = (idUsuario: number | null): string => {
  const u = usuarioPorId(idUsuario);
  return u ? `${u.Nombre} ${u.Apellido}` : '—';
};
const especialidadNombre = (id: number): string =>
  especialidadesMock.find((e) => e.Id === id)?.Nombre ?? '—';
const consultorioNombre = (id: number): string =>
  consultoriosMock.find((c) => c.Id === id)?.Nombre ?? '—';

function aTurnoConDetalles(t: Turno): TurnoConDetalles {
  const extras = turnosExtrasMock[t.Id] ?? { Hora: '00:00', Estado: 'pendiente' as EstadoTurno };
  return {
    ...t,
    Hora: extras.Hora,
    Estado: extras.Estado,
    PacienteNombreCompleto: nombreCompleto(pacienteAUsuario(t.Id_Paciente)),
    PacienteCobertura: pacientesMock.find((p) => p.Id === t.Id_Paciente)?.Cobertura,
    MedicoNombreCompleto: nombreCompleto(t.Id_Medico),
    EspecialidadNombre: especialidadNombre(t.Id_Especialidad),
    ConsultorioNombre: consultorioNombre(t.Id_Clinica),
  };
}

/** pacientes.Id → usuarios.Id. */
function pacienteAUsuario(idPaciente: number): number | null {
  return pacientesMock.find((p) => p.Id === idPaciente)?.Id_usuario ?? null;
}

function pacienteDetalle(idPaciente: number): PacienteDetalle | undefined {
  const p = pacientesMock.find((x) => x.Id === idPaciente);
  if (!p) return undefined;
  const u = p.Id_usuario ? usuarioPorId(p.Id_usuario) : undefined;
  if (!u) return undefined;
  const doc = pacientesDocumentosMock.find((d) => d.id_paciente === idPaciente);
  return {
    ...p,
    Nombre: u.Nombre,
    Apellido: u.Apellido,
    Email: u.Email,
    Fecha_Nacimiento: u.Fecha_Nacimiento,
    ...(doc ? { TipoDocumentoId: doc.id_documento, NumeroDocumento: doc.Documento } : {}),
  };
}

let proximoIdUsuario = 100;
let proximoIdPaciente = 50;
let proximoIdTurno = 1000;
let proximoIdHistoria = 1000;
let proximoIdReceta = 1000;

const CODIGO_OTP_MOCK = '123456';

/* ------------------------------------------------------------------ */
/* mockApi — implementa IApiService sobre los fixtures                 */
/* ------------------------------------------------------------------ */

export const mockApi: IApiService = {
  /* ---------- Autenticación ---------- */
  async login(Email, Contrasena) {
    await esperar();
    const cred = credencialesMock.find(
      (c) => c.Email.toLowerCase() === Email.trim().toLowerCase(),
    );
    if (!cred || cred.ContrasenaPlano !== Contrasena) {
      return errorApi('CREDENCIALES_INVALIDAS', 'Email o contraseña incorrectos.');
    }
    const u = usuariosMock.find(
      (x) => x.Email.toLowerCase() === cred.Email.toLowerCase(),
    )!;
    let rol: UsuarioAutenticado['Rol'] = 'recepcion';
    if (u.Id >= 10 && u.Id < 20) rol = 'medico';
    if (u.Id >= 21) rol = 'admin';
    return {
      ok: true,
      data: {
        Id: u.Id,
        Nombre: u.Nombre,
        Apellido: u.Apellido,
        Email: u.Email,
        Rol: rol,
        ...(rol === 'medico' ? { MedicoId: u.Id } : {}),
      },
    };
  },

  /* ---------- Catálogos ---------- */
  async getEspecialidades() {
    await esperar(200);
    return { ok: true, data: [...especialidadesMock] };
  },

  async getMedicosPorEspecialidad(Id_Especialidad) {
    await esperar(250);
    const lista: MedicoDetalle[] = medicosMock
      .filter((m) => m.Id_Especialidad === Id_Especialidad)
      .map((m) => ({
        ...m,
        NombreCompleto: nombreCompleto(m.Id_usuario),
        EspecialidadNombre: especialidadNombre(m.Id_Especialidad),
      }));
    return { ok: true, data: lista };
  },

  async getMedicos() {
    await esperar(250);
    const lista: MedicoDetalle[] = medicosMock.map((m) => ({
      ...m,
      NombreCompleto: nombreCompleto(m.Id_usuario),
      EspecialidadNombre: especialidadNombre(m.Id_Especialidad),
    }));
    return { ok: true, data: lista };
  },

  async getMedicamentos(): Promise<Result<Medicamento[]>> {
    await esperar(150);
    return { ok: true, data: [...medicamentosMock] };
  },

  async getTiposEstudio(): Promise<Result<TipoEstudio[]>> {
    await esperar(150);
    return { ok: true, data: [...tiposEstudioMock] };
  },

  async getTiposDocumento() {
    await esperar(100);
    return { ok: true, data: [...tiposDocumentoMock] };
  },

  async getGeneros() {
    await esperar(100);
    return { ok: true, data: [...generosMock] };
  },

  async getConsultoriosPorMedico(Id_medico) {
    await esperar(200);
    const ids = consultoriosMedicosMock
      .filter((cm) => cm.id_medico === Id_medico)
      .map((cm) => cm.id_consultorio);
    return {
      ok: true,
      data: consultoriosMock.filter((c) => ids.includes(c.Id)),
    };
  },

  /* ---------- Disponibilidad ---------- */
  async getDiasAtencionPorMedico(Id_medico): Promise<Result<DiaAtencion[]>> {
    await esperar(200);
    return {
      ok: true,
      data: diasAtencionMock.filter((d) => d.Id_medico === Id_medico),
    };
  },

  async getTurnosPorMedicoYFecha(Id_Medico, Fecha) {
    await esperar(250);
    const lista = turnosMock
      .filter((t) => t.Id_Medico === Id_Medico && t.Fecha.slice(0, 10) === Fecha)
      .map(aTurnoConDetalles)
      .sort((a, b) => a.Hora.localeCompare(b.Hora));
    return { ok: true, data: lista };
  },

  /* ---------- Turnos ---------- */
  async getTurnosPorPaciente(Id_Paciente) {
    await esperar(250);
    const lista = turnosMock
      .filter((t) => t.Id_Paciente === Id_Paciente)
      .map(aTurnoConDetalles)
      .sort((a, b) => `${a.Fecha}${a.Hora}`.localeCompare(`${b.Fecha}${b.Hora}`));
    return { ok: true, data: lista };
  },

  async confirmarTurno(dto: ConfirmarTurnoDTO) {
    await esperar(600);
    // Simulación de conflicto (la real es transaccional en el backend).
    const ocupados = await this.getTurnosPorMedicoYFecha(dto.Id_Medico, dto.Fecha);
    if (ocupados.ok && ocupados.data.some((t) => t.Hora === dto.Hora)) {
      return errorApi('SLOT_OCUPADO', 'Ese horario acaba de ser reservado. Elegí otro.');
    }
    const nuevo: Turno = {
      Id: proximoIdTurno++,
      Id_Paciente: dto.Id_Paciente,
      Id_Medico: dto.Id_Medico,
      Id_Especialidad: dto.Id_Especialidad,
      Id_Clinica: dto.Id_Clinica,
      Fecha: dto.Fecha,
    };
    turnosMock.push(nuevo);
    turnosExtrasMock[nuevo.Id] = { Hora: dto.Hora, Estado: 'confirmado' };
    return { ok: true, data: nuevo };
  },

  /** MOCK-ONLY (#2): simula cancelación; la BD no tiene estado. */
  async cancelarTurno(Id_Turno) {
    await esperar(400);
    const t = turnosMock.find((x) => x.Id === Id_Turno);
    if (!t) return errorApi('NO_ENCONTRADO', 'El turno no existe.');
    turnosExtrasMock[Id_Turno] = { ...(turnosExtrasMock[Id_Turno] ?? { Hora: '00:00' }), Estado: 'cancelado' };
    return { ok: true, data: aTurnoConDetalles(t) };
  },

  /** MOCK-ONLY (#2): simula marcado de asistencia/atención completada. */
  async completarTurno(Id_Turno) {
    await esperar(400);
    const t = turnosMock.find((x) => x.Id === Id_Turno);
    if (!t) return errorApi('NO_ENCONTRADO', 'El turno no existe.');
    turnosExtrasMock[Id_Turno] = { ...(turnosExtrasMock[Id_Turno] ?? { Hora: '00:00' }), Estado: 'completado' };
    return { ok: true, data: aTurnoConDetalles(t) };
  },

  /* ---------- Pacientes ---------- */
  async getPacientePorDocumento(TipoDocumentoId, Numero) {
    await esperar(300);
    const doc = pacientesDocumentosMock.find(
      (d) => d.id_documento === TipoDocumentoId && d.Documento === Numero.trim(),
    );
    if (!doc) return { ok: true, data: null };
    const detalle = pacienteDetalle(doc.id_paciente);
    return detalle
      ? { ok: true, data: detalle }
      : { ok: true, data: null };
  },

  async registrarPaciente(datos: DatosMinimosPaciente) {
    await esperar(500);
    const duplicado = pacientesDocumentosMock.some(
      (d) => d.id_documento === datos.TipoDocumentoId && d.Documento === datos.NumeroDocumento,
    );
    if (duplicado) {
      return errorApi('DOCUMENTO_EXISTENTE', 'Ya existe un paciente con ese documento.');
    }
    const nuevoUsuarioId = proximoIdUsuario++;
    usuariosMock.push({
      Id: nuevoUsuarioId,
      Id_genero: datos.GeneroId ?? generosMock[2].Id,
      Nombre: datos.Nombre,
      Apellido: datos.Apellido,
      Fecha_Nacimiento: datos.Fecha_Nacimiento,
      Email: datos.Email,
    });
    const nuevoPacienteId = proximoIdPaciente++;
    pacientesMock.push({
      Id: nuevoPacienteId,
      Id_usuario: nuevoUsuarioId,
      Cobertura: datos.Cobertura ?? 'Particular',
    });
    pacientesDocumentosMock.push({
      id_paciente: nuevoPacienteId,
      id_documento: datos.TipoDocumentoId,
      Documento: datos.NumeroDocumento,
    });
    const detalle = pacienteDetalle(nuevoPacienteId)!;
    return { ok: true, data: detalle };
  },

  async getPacientes() {
    await esperar(300);
    const lista = pacientesMock
      .map((p) => pacienteDetalle(p.Id))
      .filter((d): d is PacienteDetalle => d !== undefined);
    return { ok: true, data: lista };
  },

  /* ---------- Historia clínica ---------- */
  async getHistoriaPorPaciente(IdPaciente) {
    await esperar(350);
    const entradas: EntradaTimeline[] = historiaClinicaMock
      .filter((h) => h.IdPaciente === IdPaciente)
      .sort((a, b) => b.FechaRealizacion.localeCompare(a.FechaRealizacion))
      .map((h) => ({
        ...h,
        MedicoNombreCompleto: nombreCompleto(h.IdMedico),
        TipoEstudioNombre:
          tiposEstudioMock.find((te) => te.Id === h.IdTipoEstudio)?.Nombre ?? 'Estudio',
        Adjuntos: documentosClinicosMock.filter((dc) => dc.Id_estudio_clinico === h.Id),
        // Heurística MOCK-ONLY (#9): receta del mismo médico ±30 días.
        RecetasRelacionadas: recetasMock
          .filter(
            (r) =>
              r.IdPaciente === h.IdPaciente &&
              r.IdMedico === h.IdMedico &&
              Math.abs(Date.parse(r.Indicada) - Date.parse(h.FechaRealizacion)) <
                30 * 24 * 3600 * 1000,
          )
          .map((r) => r.Id),
      }));
    return { ok: true, data: entradas };
  },

  async crearAtencion(dto: NuevaAtencionDTO): Promise<Result<HistoriaClinica>> {
    await esperar(600);
    const nueva: HistoriaClinica = {
      Id: proximoIdHistoria++,
      IdPaciente: dto.IdPaciente,
      IdMedico: dto.IdMedico,
      IdTipoEstudio: dto.IdTipoEstudio,
      Documentos: dto.Documentos ?? null,
      Resultados: dto.Resultados ?? null,
      FechaRealizacion: dto.FechaRealizacion,
    };
    historiaClinicaMock.push(nueva);
    return { ok: true, data: nueva };
  },

  /* ---------- Recetas ---------- */
  async getRecetasPorPaciente(IdPaciente) {
    await esperar(300);
    const lista: RecetaDetalle[] = recetasMock
      .filter((r) => r.IdPaciente === IdPaciente)
      .sort((a, b) => b.Indicada.localeCompare(a.Indicada))
      .map((r) => ({
        ...r,
        PacienteNombreCompleto: nombreCompleto(pacienteAUsuario(r.IdPaciente) ?? -1),
        MedicoNombreCompleto: nombreCompleto(r.IdMedico),
        MedicamentoNombre: medicamentosMock.find((m) => m.Id === r.IdMedicacion)?.Nombre ?? '—',
      }));
    return { ok: true, data: lista };
  },

  async crearReceta(dto: CrearRecetaDTO): Promise<Result<RecetaDetalle>> {
    await esperar(550);
    const nueva = { ...dto, Id: proximoIdReceta++ };
    recetasMock.push(nueva);
    return {
      ok: true,
      data: {
        ...nueva,
        PacienteNombreCompleto: nombreCompleto(pacienteAUsuario(nueva.IdPaciente) ?? -1),
        MedicoNombreCompleto: nombreCompleto(nueva.IdMedico),
        MedicamentoNombre: medicamentosMock.find((m) => m.Id === nueva.IdMedicacion)?.Nombre ?? '—',
      },
    };
  },

  /* ---------- OTP (MOCK-ONLY #8) ---------- */
  async enviarOtp(destino) {
    await esperar(450);
    return { ok: true, data: { destino } };
  },

  async verificarOtp(_destino, codigo) {
    await esperar(350);
    if (codigo !== CODIGO_OTP_MOCK) {
      return errorApi('OTP_INVALIDO', 'El código ingresado no es correcto.');
    }
    return { ok: true, data: true };
  },
};

export const CODIGO_OTP_MOCK_PUBLICO = CODIGO_OTP_MOCK;
