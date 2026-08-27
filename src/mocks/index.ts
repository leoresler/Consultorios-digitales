// Barrel de mocks — agrupa el "dataset" coherente que consume mockApi.
// Todas las relaciones respetan los IDs del DDL:
//   usuario → paciente → turno / historia / receta
//   usuario → médico → especialidad / consultorio / días_atencion

export { generosMock } from './generos';
export { credencialesMock, usuariosMock } from './usuarios';
export type { CredencialMock } from './usuarios';
export { pacientesMock } from './pacientes';
export { pacientesDocumentosMock, tiposDocumentoMock } from './documentos';
export { especialidadesMock } from './especialidades';
export { medicosMock } from './medicos';
export { consultoriosMedicosMock, consultoriosMock } from './consultorios';
export { diasAtencionMock } from './diasAtencion';
export { turnosExtrasMock, turnosMock } from './turnos';
export { medicamentosMock, tiposEstudioMock } from './catalogos';
export { recetasMock } from './recetas';
export { documentosClinicosMock, historiaClinicaMock } from './historiaClinica';
