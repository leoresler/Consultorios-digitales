import type { DiaAtencion, DiaSemana } from '@/models';

const NOMBRES_DIAS: DiaSemana[] = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

/** 'YYYY-MM-DD' | ISO completo → nombre de día en español. */
export function diaSemanaDe(fechaISO: string): DiaSemana {
  const soloFecha = fechaISO.slice(0, 10);
  // new Date('YYYY-MM-DD') interpreta UTC; se fuerza mediodía local para evitar corrimientos.
  const d = new Date(`${soloFecha}T12:00:00`);
  return NOMBRES_DIAS[d.getDay()];
}

/** Extrae minutos desde medianoche de un ISO datetime o 'HH:mm'. */
export function aMinutos(isoOHora: string): number {
  const hhmm = isoOHora.slice(11, 16) || isoOHora.slice(0, 5);
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Minutos desde medianoche → 'HH:mm'. */
export function aHHMM(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Fecha de hoy como 'YYYY-MM-DD' local. */
export function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Suma días a una fecha 'YYYY-MM-DD'. */
export function sumarDias(fechaISO: string, dias: number): string {
  const d = new Date(`${fechaISO.slice(0, 10)}T12:00:00`);
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/**
 * Calcula los slots de una franja `dias_atencion` marcando ocupados.
 * La disponibilidad FINAL siempre la valida el backend (concurrencia).
 */
export function calcularSlots(
  dia: DiaAtencion,
  horasOcupadas: string[],
): import('@/models').SlotDisponible[] {
  const inicio = aMinutos(dia.Hora_Inicio);
  const fin = aMinutos(dia.Hora_Fin);
  const duracion = Math.max(dia.Duracion_Turno, 1);
  const slots: import('@/models').SlotDisponible[] = [];

  for (let t = inicio; t + duracion <= fin; t += duracion) {
    const hora = aHHMM(t);
    slots.push({
      Hora: hora,
      Disponible: !horasOcupadas.includes(hora),
      IdDiaAtencion: dia.Id,
    });
  }
  return slots;
}

/** 'YYYY-MM-DD' → texto legible en español: "martes 25 de agosto". */
export function formatFechaLegible(fechaISO: string): string {
  const d = new Date(`${fechaISO.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d);
}

/** Edad en años cumplidos desde una fecha 'YYYY-MM-DD'. */
export function edadDe(fechaNacimientoISO: string): number {
  const nac = new Date(`${fechaNacimientoISO.slice(0, 10)}T12:00:00`);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

/** Abreviaturas para UI compacta. */
export const DIAS_CORTOS: Record<DiaSemana, string> = {
  Lunes: 'Lun',
  Martes: 'Mar',
  Miércoles: 'Mié',
  Jueves: 'Jue',
  Viernes: 'Vie',
  Sábado: 'Sáb',
  Domingo: 'Dom',
};
