import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  DatosMinimosPaciente,
  Genero,
  PacienteDetalle,
  TipoDocumento,
} from '@/models';
import { mockApi } from '@/services/api';

/**
 * CONTROLLER (MVC) — recepción: listado de pacientes + alta manual.
 * El listado completo es PENDIENTE BD (no existe GET /pacientes);
 * la búsqueda por texto ocurre client-side sobre ese listado.
 */
export interface RecepcionPacientesEstado {
  pacientes: PacienteDetalle[];
  filtrados: PacienteDetalle[];
  cargando: boolean;
  errorCarga: string | null;
  busqueda: string;
  setBusqueda(valor: string): void;

  /* Catálogos para el formulario de alta */
  tiposDocumento: TipoDocumento[];
  generos: Genero[];

  formularioAbierto: boolean;
  alternarFormulario(): void;

  registrando: boolean;
  errorRegistro: string | null;
  registrado: PacienteDetalle | null;
  limpiarRegistrado(): void;
  registrar(datos: DatosMinimosPaciente): Promise<boolean>;
}

/** Valida el formulario de alta; devuelve el primer error o null. */
export function validarDatosPaciente(datos: DatosMinimosPaciente): string | null {
  if (!datos.TipoDocumentoId) return 'Elegí el tipo de documento.';
  if (!datos.NumeroDocumento.trim()) return 'Ingresá el número de documento.';
  if (!datos.Nombre.trim()) return 'Ingresá el nombre.';
  if (!datos.Apellido.trim()) return 'Ingresá el apellido.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.Email.trim())) {
    return 'Ingresá un email válido.';
  }
  if (!datos.Fecha_Nacimiento) return 'Ingresá la fecha de nacimiento.';
  if (datos.Fecha_Nacimiento > new Date().toISOString().slice(0, 10)) {
    return 'La fecha de nacimiento no puede ser futura.';
  }
  return null;
}

export function useRecepcionPacientes(): RecepcionPacientesEstado {
  const [pacientes, setPacientes] = useState<PacienteDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null);
  const [registrado, setRegistrado] = useState<PacienteDetalle | null>(null);

  useEffect(() => {
    let vigente = true;
    void (async () => {
      setCargando(true);
      setErrorCarga(null);
      const r = await mockApi.getPacientes();
      if (!vigente) return;
      if (r.ok) setPacientes(r.data);
      else setErrorCarga(r.error.mensaje);
      setCargando(false);
    })();
    const cargarCatalogo = async () => {
      const [rDoc, rGen] = await Promise.all([
        mockApi.getTiposDocumento(),
        mockApi.getGeneros(),
      ]);
      if (!vigente) return;
      if (rDoc.ok) setTiposDocumento(rDoc.data);
      if (rGen.ok) setGeneros(rGen.data);
    };
    void cargarCatalogo();
    return () => {
      vigente = false;
    };
  }, []);

  const recargar = useCallback(async () => {
    const r = await mockApi.getPacientes();
    if (r.ok) setPacientes(r.data);
  }, []);

  const registrar = useCallback(
    async (datos: DatosMinimosPaciente): Promise<boolean> => {
      const errorValidacion = validarDatosPaciente(datos);
      if (errorValidacion) {
        setErrorRegistro(errorValidacion);
        return false;
      }
      setRegistrando(true);
      setErrorRegistro(null);
      const r = await mockApi.registrarPaciente(datos);
      setRegistrando(false);
      if (!r.ok) {
        setErrorRegistro(r.error.mensaje);
        return false;
      }
      setRegistrado(r.data);
      setFormularioAbierto(false);
      await recargar();
      return true;
    },
    [recargar],
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pacientes;
    return pacientes.filter((p) =>
      [p.Nombre, p.Apellido, p.Email, p.Cobertura, p.NumeroDocumento ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [busqueda, pacientes]);

  return {
    pacientes,
    filtrados,
    cargando,
    errorCarga,
    busqueda,
    setBusqueda,
    tiposDocumento,
    generos,
    formularioAbierto,
    alternarFormulario: () => {
      setErrorRegistro(null);
      setFormularioAbierto((abierto) => !abierto);
    },
    registrando,
    errorRegistro,
    registrado,
    limpiarRegistrado: () => setRegistrado(null),
    registrar,
  };
}
