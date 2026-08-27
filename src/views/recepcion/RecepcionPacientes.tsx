import { useState } from 'react';
import { Link } from 'react-router-dom';

import { CampoSelect, CampoTexto } from '@/components/forms/Campo';
import { useAuth } from '@/controllers/useAuth';
import {
  useRecepcionPacientes,
  validarDatosPaciente,
} from '@/controllers/useRecepcionPacientes';
import type { DatosMinimosPaciente, PacienteDetalle } from '@/models';
import { edadDe } from '@/utils/fechas';

/**
 * VIEW (MVC) — recepción: buscador de pacientes, alta manual y acceso
 * a historia clínica (solo roles con permiso sobre esa ruta).
 */
export default function RecepcionPacientes() {
  const p = useRecepcionPacientes();

  return (
    <div className="page-clinica">
      <header className="section-clinica flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-clinica-title">Pacientes</h2>
          <p className="section-clinica-subtitle">
            Buscá por nombre, documento o email, o registrá un paciente nuevo.
          </p>
        </div>
        <button type="button" className="btn-clinica" onClick={p.alternarFormulario}>
          {p.formularioAbierto ? 'Cerrar formulario' : '+ Nuevo paciente'}
        </button>
      </header>

      {p.registrado && (
        <div className="card-clinica mb-4 flex flex-wrap items-center justify-between gap-3 border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <span>
            ✅ <strong>{p.registrado.Nombre} {p.registrado.Apellido}</strong> fue registrado
            correctamente.
          </span>
          <button type="button" className="btn-clinica-ghost !px-2 text-xs" onClick={p.limpiarRegistrado}>
            ✕
          </button>
        </div>
      )}

      {p.formularioAbierto && (
        <FormularioAlta
          tiposDocumento={p.tiposDocumento}
          generos={p.generos}
          enviando={p.registrando}
          error={p.errorRegistro}
          onCancelar={p.alternarFormulario}
          onEnviar={(datos) => void p.registrar(datos)}
        />
      )}

      <div className="mb-4">
        <CampoTexto
          id="buscar-paciente"
          label="Buscar"
          placeholder="Nombre, documento, email u obra social…"
          value={p.busqueda}
          onChange={(e) => p.setBusqueda(e.target.value)}
        />
      </div>

      {p.errorCarga && (
        <div className="card-clinica border-red-200 bg-red-50 p-4 text-sm text-red-700">{p.errorCarga}</div>
      )}

      {p.cargando ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton-clinica h-20" />
          ))}
        </div>
      ) : p.filtrados.length === 0 ? (
        <div className="card-clinica p-10 text-center text-sm text-slate-500">
          {p.busqueda
            ? `Sin resultados para “${p.busqueda}”.`
            : 'Todavía no hay pacientes registrados.'}
        </div>
      ) : (
        <ul className="space-y-3">
          {p.filtrados.map((pac) => (
            <FilaPaciente key={pac.Id} paciente={pac} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilaPaciente({ paciente: pac }: { paciente: PacienteDetalle }) {
  const { usuario } = useAuth();
  const puedeVerHistoria = usuario?.Rol === 'medico' || usuario?.Rol === 'admin';

  return (
    <li className="card-clinica flex flex-wrap items-center gap-3 p-4 transition hover:border-blue-300 sm:flex-nowrap">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
        {pac.Nombre[0]}
        {pac.Apellido[0]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900">
          {pac.Nombre} {pac.Apellido}
          <span className="ml-2 text-xs font-normal text-slate-400">
            {edadDe(pac.Fecha_Nacimiento)} años
          </span>
        </p>
        <p className="truncate text-xs text-slate-500">
          {pac.NumeroDocumento ? `${pac.NumeroDocumento} · ` : ''}
          {pac.Email}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span className="badge-turno badge-neutral">{pac.Cobertura}</span>
        {puedeVerHistoria && (
          <Link
            to={`/pacientes/${pac.Id}/historia`}
            className="btn-clinica-secondary !px-3 !py-1.5 text-xs"
          >
            Historia
          </Link>
        )}
      </div>
    </li>
  );
}

interface FormularioAltaProps {
  tiposDocumento: { Id: number; Nombre: string }[];
  generos: { Id: number; Nombre: string }[];
  enviando: boolean;
  error: string | null;
  onCancelar(): void;
  onEnviar(datos: DatosMinimosPaciente): void;
}

function FormularioAlta({
  tiposDocumento,
  generos,
  enviando,
  error,
  onCancelar,
  onEnviar,
}: FormularioAltaProps) {
  const [form, setForm] = useState<DatosMinimosPaciente>({
    TipoDocumentoId: 0,
    NumeroDocumento: '',
    Nombre: '',
    Apellido: '',
    Email: '',
    Fecha_Nacimiento: '',
    GeneroId: undefined,
    Cobertura: '',
    Telefono: '', // MOCK-ONLY #8
  });

  const set = (parcial: Partial<DatosMinimosPaciente>) =>
    setForm((prev) => ({ ...prev, ...parcial }));

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (validarDatosPaciente(form)) return; // el controller igualmente revalida
    onEnviar(form);
  };

  return (
    <form
      onSubmit={enviar}
      className="card-clinica mb-6 grid grid-cols-1 gap-4 p-5 sm:grid-cols-2"
    >
      <h3 className="section-clinica-title text-base sm:col-span-2">Registrar nuevo paciente</h3>

      <CampoSelect
        id="alta-tipo-doc"
        label="Tipo de documento"
        placeholder="Elegir…"
        opciones={tiposDocumento.map((t) => ({ value: String(t.Id), label: t.Nombre }))}
        value={form.TipoDocumentoId || ''}
        onChange={(e) => set({ TipoDocumentoId: Number(e.target.value) })}
      />
      <CampoTexto
        id="alta-numero-doc"
        label="Número de documento"
        inputMode="numeric"
        placeholder="Solo números"
        value={form.NumeroDocumento}
        onChange={(e) => set({ NumeroDocumento: e.target.value.replace(/\D/g, '') })}
      />
      <CampoTexto
        id="alta-nombre"
        label="Nombre"
        maxLength={20}
        value={form.Nombre}
        onChange={(e) => set({ Nombre: e.target.value })}
        hint="Máximo 20 caracteres (según BD)."
      />
      <CampoTexto
        id="alta-apellido"
        label="Apellido"
        maxLength={50}
        value={form.Apellido}
        onChange={(e) => set({ Apellido: e.target.value })}
      />
      <CampoTexto
        id="alta-email"
        label="Email"
        type="email"
        value={form.Email}
        onChange={(e) => set({ Email: e.target.value })}
      />
      <CampoTexto
        id="alta-fecha-nac"
        label="Fecha de nacimiento"
        type="date"
        max={new Date().toISOString().slice(0, 10)}
        value={form.Fecha_Nacimiento}
        onChange={(e) => set({ Fecha_Nacimiento: e.target.value })}
      />
      <CampoSelect
        id="alta-genero"
        label="Género"
        placeholder="Opcional…"
        opciones={generos.map((g) => ({ value: String(g.Id), label: g.Nombre }))}
        value={form.GeneroId ?? ''}
        onChange={(e) => set({ GeneroId: e.target.value ? Number(e.target.value) : undefined })}
      />
      <CampoTexto
        id="alta-cobertura"
        label="Cobertura / Obra social"
        maxLength={40}
        placeholder="Texto libre (DISCREPANCIA #14)"
        value={form.Cobertura ?? ''}
        onChange={(e) => set({ Cobertura: e.target.value })}
      />
      <CampoTexto
        id="alta-telefono"
        label="Teléfono"
        inputMode="tel"
        placeholder="Opcional"
        value={form.Telefono ?? ''}
        onChange={(e) => set({ Telefono: e.target.value })}
        hint="MOCK #8: la BD no tiene columna teléfono."
      />

      {error && (
        <p className="error-text sm:col-span-2" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 sm:col-span-2">
        <button type="button" className="btn-clinica-ghost" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn-clinica" disabled={enviando}>
          {enviando ? 'Registrando…' : 'Registrar paciente'}
        </button>
      </div>
    </form>
  );
}
