import { useCallback, useState } from 'react';

import { validarDatosPaciente } from '@/controllers/useRecepcionPacientes';
import type { DatosMinimosPaciente, PacienteDetalle } from '@/models';
import { mockApi } from '@/services/api';
import {
  guardarMarcadorRegistro,
  leerReservaPendiente,
  limpiarMarcadorRegistro,
  limpiarReservaPendiente,
} from '@/utils/reservaPendiente';

/**
 * CONTROLLER (MVC) — alta de paciente en página propia (/registro).
 * Mini-máquina: formulario → OTP → éxito. Al terminar escribe el marcador
 * para que el wizard de reserva retome donde quedó (?registrado=1).
 */
export type PasoRegistro = 'form' | 'otp' | 'exito';

export interface RegistroEstado {
  paso: PasoRegistro;
  form: DatosMinimosPaciente;
  setCampo(k: keyof DatosMinimosPaciente, v: string | number): void;
  enviandoOtp: boolean;
  verificandoOtp: boolean;
  error: string | null;
  otpDestino: string | null;
  registrado: PacienteDetalle | null;
  submitDatos(): Promise<boolean>;
  verificarOtp(codigo: string): Promise<boolean>;
  reenviarOtp(): Promise<void>;
  volver(): void;
  descartar(): void;
}

export function useRegistro(): RegistroEstado {
  const prefill = leerReservaPendiente();

  const [paso, setPaso] = useState<PasoRegistro>('form');
  const [form, setForm] = useState<DatosMinimosPaciente>(() => ({
    TipoDocumentoId: prefill?.tipoDocId ?? 1,
    NumeroDocumento: prefill?.numeroDocumento ?? '',
    Nombre: '',
    Apellido: '',
    Email: '',
    Fecha_Nacimiento: '',
    Cobertura: '',
    Telefono: '',
  }));
  const [enviandoOtp, setEnviandoOtp] = useState(false);
  const [verificandoOtp, setVerificandoOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpDestino, setOtpDestino] = useState<string | null>(null);
  const [registrado, setRegistrado] = useState<PacienteDetalle | null>(null);

  const setCampo = useCallback(
    (k: keyof DatosMinimosPaciente, v: string | number) =>
      setForm((prev) => ({ ...prev, [k]: v }) as DatosMinimosPaciente),
    [],
  );

  const submitDatos = useCallback(async (): Promise<boolean> => {
    const errorValidacion = validarDatosPaciente(form);
    if (errorValidacion) {
      setError(errorValidacion);
      return false;
    }
    setError(null);
    setEnviandoOtp(true);
    const destino = form.Telefono?.trim() || form.Email;
    const rOtp = await mockApi.enviarOtp(destino);
    setEnviandoOtp(false);
    if (!rOtp.ok) {
      setError('No pudimos enviar el código de verificación.');
      return false;
    }
    setOtpDestino(destino);
    setPaso('otp');
    return true;
  }, [form]);

  const verificarOtp = useCallback(
    async (codigo: string): Promise<boolean> => {
      if (!otpDestino) return false;
      setError(null);
      setVerificandoOtp(true);
      const r = await mockApi.verificarOtp(otpDestino, codigo);
      if (!r.ok) {
        setVerificandoOtp(false);
        setError(r.error.mensaje);
        return false;
      }
      const rAlta = await mockApi.registrarPaciente(form);
      setVerificandoOtp(false);
      if (!rAlta.ok) {
        setError(rAlta.error.mensaje);
        setPaso('form');
        return false;
      }
      guardarMarcadorRegistro({
        tipoDocId: form.TipoDocumentoId,
        numeroDocumento: form.NumeroDocumento,
      });
      setRegistrado(rAlta.data);
      setPaso('exito');
      return true;
    },
    [form, otpDestino],
  );

  const reenviarOtp = useCallback(async () => {
    if (otpDestino) await mockApi.enviarOtp(otpDestino);
  }, [otpDestino]);

  const volver = useCallback(() => {
    setError(null);
    setPaso('form');
  }, []);

  /** Abandono explícito: descarta la reserva pendiente y el marcador. */
  const descartar = useCallback(() => {
    limpiarReservaPendiente();
    limpiarMarcadorRegistro();
    setError(null);
    setPaso('form');
  }, []);

  return {
    paso,
    form,
    setCampo,
    enviandoOtp,
    verificandoOtp,
    error,
    otpDestino,
    registrado,
    submitDatos,
    verificarOtp,
    reenviarOtp,
    volver,
    descartar,
  };
}