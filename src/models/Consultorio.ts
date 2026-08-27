import type { ID } from '@/types/common';

/**
 * Tabla `consultorios` — espejo fiel del DDL.
 * DISCREPANCIAS #10: `turnos.Id_Clinica` referencia esta tabla.
 */
export interface Consultorio {
  Id: ID;
  Nombre: string;
  Direccion: string;
}

/**
 * Tabla `consultorios_medicos` — junction sin PK declarada en la BD
 * (DISCREPANCIAS #11). Clave natural: (id_consultorio, id_medico).
 */
export interface ConsultorioMedico {
  id_consultorio: number;
  id_medico: number;
}
