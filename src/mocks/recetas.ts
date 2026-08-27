import type { Receta } from '@/models';

/**
 * Tabla `recetas`. Dosis/Frecuencia son INT sin unidad según DDL
 * (DISCREPANCIAS #7): la UI las presenta como números crudos.
 */
export const recetasMock: Receta[] = [
  { Id: 1, IdPaciente: 1, IdMedico: 10, IdMedicacion: 4, Dosis: 50, Frecuencia: 24, Indicada: '2026-08-10', Vigencia: '2026-11-10' },
  { Id: 2, IdPaciente: 1, IdMedico: 12, IdMedicacion: 7, Dosis: 10, Frecuencia: 24, Indicada: '2026-08-01', Vigencia: '2026-09-01' },
  { Id: 3, IdPaciente: 2, IdMedico: 11, IdMedicacion: 2, Dosis: 500, Frecuencia: 8, Indicada: '2026-08-20', Vigencia: '2026-09-05' },
  { Id: 4, IdPaciente: 3, IdMedico: 13, IdMedicacion: 9, Dosis: 100, Frecuencia: 8, Indicada: '2026-07-15', Vigencia: '2026-10-15' },
];
