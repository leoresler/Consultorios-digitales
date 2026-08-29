import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { CampoSelect, CampoTexto } from '@/components/forms/Campo';
import PublicHeader from '@/components/layout/PublicHeader';
import { useRegistro } from '@/controllers/useRegistro';
import type { TipoDocumento } from '@/models';
import { mockApi } from '@/services/api';
import type { Result } from '@/types/common';

/**
 * VIEW (MVC) — alta de paciente en página propia.
 * Se llega desde el paso de identificación del wizard (/reserva): al
 * terminar, /registro vuelve a la reserva con ?registrado=1 y el wizard
 * restaura lo ya elegido.
 */
export default function RegistroPaciente() {
  const r = useRegistro();
  const navigate = useNavigate();
  const [tipos, setTipos] = useState<Result<TipoDocumento[]> | null>(null);
  const [otpCodigo, setOtpCodigo] = useState('');

  useEffect(() => {
    let vigente = true;
    mockApi.getTiposDocumento().then((t) => vigente && setTipos(t));
    return () => {
      vigente = false;
    };
  }, []);

  const opcionesDoc = (tipos?.ok ? tipos.data : []).map((t) => ({
    value: String(t.Id),
    label: t.Nombre,
  }));

  if (r.paso === 'exito' && r.registrado) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicHeader />
        <main className="page-clinica max-w-lg">
          <section className="pt-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
              ✓
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              ¡Usuario registrado!
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ya podés volver a tu reserva con todo lo elegido intacto.
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                className="btn-clinica w-full sm:w-auto"
                onClick={() => navigate('/reserva?registrado=1')}
              >
                Volver a completar la reserva
              </button>
              <Link to="/" className="btn-clinica-secondary w-full sm:w-auto">
                Ir al inicio
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="page-clinica mx-auto max-w-2xl">
        {r.paso === 'form' ? (
          <section>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Registrate para reservar
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Es la primera vez que te vemos. Al terminar volveremos a tu reserva
              en el punto donde quedaste, sin perder lo ya seleccionado.
            </p>

            {r.error && (
              <div className="my-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {r.error}
              </div>
            )}

            <form
              className="card-clinica mt-4 grid grid-cols-1 gap-4 p-5 sm:grid-cols-2"
              noValidate
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                void r.submitDatos();
              }}
            >
              <CampoSelect
                id="r-tipodoc"
                label="Tipo de documento"
                required
                opciones={opcionesDoc}
                value={String(r.form.TipoDocumentoId)}
                onChange={(e) =>
                  r.setCampo('TipoDocumentoId', Number(e.target.value) || 1)
                }
              />
              <CampoTexto
                id="r-numdoc"
                label="Número de documento"
                required
                placeholder="El que ya ingresaste en la reserva"
                value={r.form.NumeroDocumento}
                onChange={(e) => r.setCampo('NumeroDocumento', e.target.value)}
              />
              <CampoTexto
                id="r-nombre"
                label="Nombre"
                required
                autoComplete="given-name"
                value={r.form.Nombre}
                onChange={(e) => r.setCampo('Nombre', e.target.value)}
              />
              <CampoTexto
                id="r-apellido"
                label="Apellido"
                required
                autoComplete="family-name"
                value={r.form.Apellido}
                onChange={(e) => r.setCampo('Apellido', e.target.value)}
              />
              <CampoTexto
                id="r-email"
                label="Email"
                type="email"
                required
                autoComplete="email"
                value={r.form.Email}
                onChange={(e) => r.setCampo('Email', e.target.value)}
              />
              <CampoTexto
                id="r-tel"
                label="Teléfono (opcional)"
                hint="Si lo cargás, el código de verificación llega ahí."
                inputMode="tel"
                autoComplete="tel"
                value={r.form.Telefono ?? ''}
                onChange={(e) => r.setCampo('Telefono', e.target.value)}
              />
              <CampoTexto
                id="r-fnac"
                label="Fecha de nacimiento"
                type="date"
                required
                value={r.form.Fecha_Nacimiento}
                onChange={(e) => r.setCampo('Fecha_Nacimiento', e.target.value)}
              />
              <CampoTexto
                id="r-cobertura"
                label="Obra social / cobertura (opcional)"
                value={r.form.Cobertura ?? ''}
                onChange={(e) => r.setCampo('Cobertura', e.target.value)}
              />

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={r.enviandoOtp}
                  className="btn-clinica w-full"
                >
                  {r.enviandoOtp ? 'Enviando código…' : 'Registrarme y continuar'}
                </button>
                <p className="hint-text text-center">
                  Validaremos tu contacto con un código por OTP.
                </p>
              </div>
            </form>

            <p className="mt-4 text-center text-sm">
              <button
                type="button"
                className="text-slate-500 hover:text-slate-700"
                onClick={() => {
                  r.descartar();
                  navigate('/reserva');
                }}
              >
                ← Volver sin registrarme
              </button>
            </p>
          </section>
        ) : (
          <section>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Verificá tu contacto
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enviamos un código a {r.otpDestino ?? 'tu contacto'}.
            </p>

            {r.error && (
              <div className="my-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {r.error}
              </div>
            )}

            <form
              className="card-clinica mt-4 space-y-4 p-5"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                void r.verificarOtp(otpCodigo);
              }}
            >
              <CampoTexto
                id="r-otp"
                label="Código de verificación"
                inputMode="numeric"
                maxLength={6}
                required
                className="text-center text-xl tracking-[0.5em]"
                value={otpCodigo}
                onChange={(e) => setOtpCodigo(e.target.value.replace(/\D/g, ''))}
              />
              <p className="badge-turno badge-warning mx-auto">MOCK OTP — código: 123456</p>
              <button
                type="submit"
                disabled={otpCodigo.length !== 6 || r.verificandoOtp}
                className="btn-clinica w-full"
              >
                {r.verificandoOtp ? 'Verificando…' : 'Verificar y continuar'}
              </button>
              <button
                type="button"
                className="btn-clinica-ghost w-full"
                onClick={() => void r.reenviarOtp()}
              >
                Reenviar código
              </button>
            </form>

            <button
              type="button"
              className="btn-clinica-ghost mt-3 !px-2"
              onClick={r.volver}
            >
              ← Corregir mis datos
            </button>
          </section>
        )}
      </main>
    </div>
  );
}