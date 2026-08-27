import type { PacienteDocumento, TipoDocumento } from '@/models';

/** Catálogo `documentos`. */
export const tiposDocumentoMock: TipoDocumento[] = [
  { Id: 1, Nombre: 'DNI' },
  { Id: 2, Nombre: 'Pasaporte' },
  { Id: 3, Nombre: 'Libreta Cívica' },
];

/** Tabla `usuarios_documento` (junction sin PK — DISCREPANCIAS #11). */
export const pacientesDocumentosMock: PacienteDocumento[] = [
  { id_paciente: 1, id_documento: 1, Documento: '38294657' },
  { id_paciente: 2, id_documento: 1, Documento: '27194835' },
  { id_paciente: 3, id_documento: 1, Documento: '63928471' },
  { id_paciente: 4, id_documento: 2, Documento: 'AB123456' },
];
