import type { Consultorio, ConsultorioMedico } from '@/models';

export const consultoriosMock: Consultorio[] = [
  { Id: 1, Nombre: 'Consultorio 1 — Planta Baja', Direccion: 'Av. Central 742, PB' },
  { Id: 2, Nombre: 'Consultorio 2 — Primer Piso', Direccion: 'Av. Central 742, 1°P' },
  { Id: 3, Nombre: 'Sala de Cardiología', Direccion: 'Av. Central 742, PB — Ala Este' },
];

export const consultoriosMedicosMock: ConsultorioMedico[] = [
  { id_consultorio: 1, id_medico: 11 },
  { id_consultorio: 1, id_medico: 14 },
  { id_consultorio: 3, id_medico: 10 },
  { id_consultorio: 2, id_medico: 12 },
  { id_consultorio: 2, id_medico: 13 },
];
