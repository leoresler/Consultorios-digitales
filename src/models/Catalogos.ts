/**
 * Tabla `medicamentos`.
 */
export interface Medicamento {
  Id: number;
  Nombre: string;
}

/**
 * Tabla `tipos_estudio`.
 *
 * DISCREPANCIAS #5: NO asumir equivalencia con una hipotética entidad
 * `estudio_clinico`; esa tabla no existe (la FK de documentos_clinicos
 * apunta a historia_clinica).
 */
export interface TipoEstudio {
  Id: number;
  Nombre: string;
}
