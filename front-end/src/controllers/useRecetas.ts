import { useCallback, useEffect, useState } from 'react';

import type { Medicamento, RecetaDetalle } from '@/models';
import type { CrearRecetaDTO } from '@/models';
import { mockApi } from '@/services/api';
import { hoyISO } from '@/utils/fechas';

/**
 * CONTROLLER (MVC) — emisión de recetas.
 *
 * DISCREPANCIAS #7: Dosis/Frecuencia son INT sin unidad en BD; la UI
 * aclara las unidades sugeridas pero el backend recibe solo números.
 */
export interface FormularioReceta {
  IdMedicacion: string;
  Dosis: string;
  Frecuencia: string;
  Indicada: string;
  Vigencia: string;
}

export interface RecetasEstado {
  medicamentos: Medicamento[];
  cargandoCatalogo: boolean;
  guardando: boolean;
  error: string | null;
  creada: RecetaDetalle | null;

  crear(dto: CrearRecetaDTO): Promise<boolean>;
}

export function useRecetas(): RecetasEstado {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creada, setCreada] = useState<RecetaDetalle | null>(null);

  useEffect(() => {
    let vigente = true;
    mockApi.getMedicamentos().then((r) => {
      if (!vigente) return;
      if (r.ok) setMedicamentos(r.data);
      setCargandoCatalogo(false);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const crear = useCallback(
    async (dto: CrearRecetaDTO): Promise<boolean> => {
      setGuardando(true);
      setError(null);
      const r = await mockApi.crearReceta(dto);
      setGuardando(false);
      if (!r.ok) {
        setError(r.error.mensaje);
        return false;
      }
      setCreada(r.data);
      return true;
    },
    [],
  );

  return { medicamentos, cargandoCatalogo, guardando, error, creada, crear };
}

/** Valida el formulario y devuelve DTO listo o mensaje de error. */
export function validarFormularioReceta(
  form: FormularioReceta,
): { ok: true; dto: Omit<CrearRecetaDTO, 'IdPaciente' | 'IdMedico'> } | { ok: false; error: string } {
  const IdMedicacion = Number(form.IdMedicacion);
  const Dosis = Number(form.Dosis);
  const Frecuencia = Number(form.Frecuencia);
  if (!IdMedicacion) return { ok: false, error: 'Elegí un medicamento.' };
  if (!Number.isInteger(Dosis) || Dosis <= 0) return { ok: false, error: 'La dosis debe ser un número entero positivo.' };
  if (!Number.isInteger(Frecuencia) || Frecuencia <= 0) return { ok: false, error: 'La frecuencia debe ser un número entero positivo.' };
  if (!form.Indicada) return { ok: false, error: 'Indicá la fecha de indicación.' };
  if (!form.Vigencia) return { ok: false, error: 'Indicá la vigencia.' };
  if (form.Vigencia < form.Indicada) return { ok: false, error: 'La vigencia no puede ser anterior a la indicación.' };
  return {
    ok: true,
    dto: { IdMedicacion, Dosis, Frecuencia, Indicada: form.Indicada, Vigencia: form.Vigencia },
  };
}

export function formularioInicial(): FormularioReceta {
  return {
    IdMedicacion: '',
    Dosis: '',
    Frecuencia: '',
    Indicada: hoyISO(),
    Vigencia: hoyISO(),
  };
}
