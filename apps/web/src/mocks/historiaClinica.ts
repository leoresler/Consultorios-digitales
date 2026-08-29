import type { DocumentoClinico, HistoriaClinica } from '@/models';

/**
 * Tabla `historia_clinica`. Toda fila exige IdTipoEstudio (DISCREPANCIAS #3):
 * el fixture solo contiene entradas de tipo estudio.
 */
export const historiaClinicaMock: HistoriaClinica[] = [
  {
    Id: 1,
    IdPaciente: 1,
    IdMedico: 10,
    IdTipoEstudio: 4,
    Documentos: 'Electrocardiograma en reposo de 12 derivaciones.',
    Resultados: 'Ritmo sinusal, frecuencia 72 lpm. Sin alteraciones de la repolarización.',
    FechaRealizacion: '2026-06-10',
  },
  {
    Id: 2,
    IdPaciente: 1,
    IdMedico: 10,
    IdTipoEstudio: 1,
    Documentos: 'Orden de laboratorio — perfil lipídico completo.',
    Resultados: 'Colesterol total 195 mg/dl. LDL 112 mg/dl. Glucemia 92 mg/dl.',
    FechaRealizacion: '2026-08-05',
  },
  {
    Id: 3,
    IdPaciente: 2,
    IdMedico: 11,
    IdTipoEstudio: 1,
    Documentos: 'Análisis clínico anual.',
    Resultados: 'Glucemia en ayunas 118 mg/dl. Se solicita curva de tolerancia.',
    FechaRealizacion: '2026-07-20',
  },
  {
    Id: 4,
    IdPaciente: 3,
    IdMedico: 13,
    IdTipoEstudio: 3,
    Documentos: 'Ecografía abdominal pediátrica.',
    Resultados: 'Hígado y vías biliares normales. Sin free fluid.',
    FechaRealizacion: '2026-05-12',
  },
];

/** Tabla `documentos_clinicos` (FK id_estudio_clinico → historia_clinica.Id). */
export const documentosClinicosMock: DocumentoClinico[] = [
  { Id: 1, Id_estudio_clinico: 1, Archivo: '/adjuntos/hc/1/ecg_20260610.pdf' },
  { Id: 2, Id_estudio_clinico: 2, Archivo: '/adjuntos/hc/2/laboratorio_20260805.pdf' },
  { Id: 3, Id_estudio_clinico: 4, Archivo: '/adjuntos/hc/4/eco_abdominal_20260512.pdf' },
];
