import type { Medicamento, TipoEstudio } from '@/models';

export const medicamentosMock: Medicamento[] = [
  { Id: 1, Nombre: 'Ibuprofeno' },
  { Id: 2, Nombre: 'Paracetamol' },
  { Id: 3, Nombre: 'Amoxicilina' },
  { Id: 4, Nombre: 'Losartán' },
  { Id: 5, Nombre: 'Enalapril' },
  { Id: 6, Nombre: 'Omeprazol' },
  { Id: 7, Nombre: 'Loratadina' },
  { Id: 8, Nombre: 'Metformina' },
  { Id: 9, Nombre: 'Salbutamol' },
  { Id: 10, Nombre: 'Aspirina' },
];

export const tiposEstudioMock: TipoEstudio[] = [
  { Id: 1, Nombre: 'Análisis de Sangre' },
  { Id: 2, Nombre: 'Radiografía' },
  { Id: 3, Nombre: 'Ecografía' },
  { Id: 4, Nombre: 'Electrocardiograma' },
  { Id: 5, Nombre: 'Resonancia Magnética' },
];
