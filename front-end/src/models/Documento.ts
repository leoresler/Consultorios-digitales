import type { HoraHHMM, ID } from '@/types/common';

/**
 * Tabla `documentos`.
 */
export interface TipoDocumento {
  Id: ID;
  Nombre: string;
}

/**
 * Tabla `usuarios_documento` — junction sin PK declarada en la BD
 * (DISCREPANCIAS #11). Clave natural: (id_paciente, id_documento).
 *
 * Nota: pese al nombre, referencía pacientes (no usuarios directamente).
 */
export interface PacienteDocumento {
  id_paciente: number;
  id_documento: number;
  /** Número de documento del paciente. Identidad del flujo público. */
  Documento: string;
}

/** VIEW-MODEL para UI de identificación por documento. */
export interface IdentificacionPaciente {
  TipoDocumentoId: number;
  TipoDocumentoNombre: string;
  Numero: PacienteDocumento['Documento'];
}

/** VIEW-MODEL: datos mínimos de alta de paciente nuevo en el flujo público. */
export interface DatosMinimosPaciente {
  TipoDocumentoId: number;
  NumeroDocumento: string;
  Nombre: string;
  Apellido: string;
  Email: string;
  Fecha_Nacimiento: string;
  GeneroId?: number;
  Cobertura?: string;
  Telefono?: string; /** MOCK-ONLY: la BD no tiene teléfono (#8 OTP). */
}

/** VIEW-MODEL: resultado de verificación OTP simulada (#8). */
export interface OtpVerificacion {
  CodigoEnviadoA: string;
  /** Solo en entorno mock. En producción nunca viaja al cliente. */
  CodigoMock: string;
  ExpiraEn: HoraHHMM;
  AceptaTerminos: boolean;
}
