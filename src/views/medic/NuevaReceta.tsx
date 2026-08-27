import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { CampoTexto, CampoSelect } from '@/components/forms/Campo';
import { useAuth } from '@/controllers/useAuth';
import {
  formularioInicial,
  validarFormularioReceta,
  useRecetas,
} from '@/controllers/useRecetas';
import type { FormularioReceta } from '@/controllers/useRecetas';
import { mockApi } from '@/services/api';
import type { Result } from '@/types/common';
import type { TipoDocumento } from '@/models';

/**
 * VIEW (MVC) — emisión de receta para un paciente.
 * Ruta: /recetas/nueva/:idPaciente? — si falta el paciente se identifica
 * por documento (mismo patrón del portal público).
 */
export default function NuevaReceta() {
  const params = useParams();
  const idPaciente = Number(params.idPaciente) || null;

  if (!idPaciente) return <IdentificarPaciente />;
  return <FormularioReceta idPaciente={idPaciente} />;
}

function IdentificarPaciente() {
  const navigate = useNavigate();
  const [tipos, setTipos] = useState<Result<TipoDocumento[]> | null>(null);
  const [tipoDocId, setTipoDocId] = useState('');
  const [numero, setNumero] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    let vigente = true;
    mockApi.getTiposDocumento().then((t) => vigente && setTipos(t));
    return () => {
      vigente = false;
    };
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBuscando(true);
    setError(null);
    const r = await mockApi.getPacientePorDocumento(Number(tipoDocId), numero);
    setBuscando(false);
    if (!r.ok) {
      setError('Error de red. Intentá de nuevo.');
      return;
    }
    if (!r.data) {
      setError('No encontramos un paciente con ese documento.');
      return;
    }
    navigate(`/recetas/nueva/${r.data.Id}`);
  };

  return (
    <div className="page-clinica max-w-lg">
      <header className="section-clinica">
        <h2 className="section-clinica-title">Nueva receta</h2>
        <p className="section-clinica-subtitle">Primero identificá al paciente por su documento.</p>
      </header>
      <form onSubmit={onSubmit} className="card-clinica space-y-4 p-5" noValidate>
        <CampoSelect
          id="rec-tipo-doc"
          label="Tipo de documento"
          placeholder="Elegí…"
          required
          opciones={(tipos?.ok ? tipos.data : []).map((t) => ({ value: String(t.Id), label: t.Nombre }))}
          value={tipoDocId}
          onChange={(e) => setTipoDocId(e.target.value)}
        />
        <CampoTexto
          id="rec-num-doc"
          label="Número de documento"
          inputMode="numeric"
          required
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />
        {error && <span className="error-text">{error}</span>}
        <button type="submit" disabled={buscando || !tipoDocId || !numero} className="btn-clinica w-full">
          {buscando ? 'Buscando…' : 'Continuar'}
        </button>
      </form>
    </div>
  );
}

function FormularioReceta({ idPaciente }: { idPaciente: number }) {
  const { usuario } = useAuth();
  const r = useRecetas();
  const [form, setForm] = useState<FormularioReceta>(formularioInicial);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // El médico logueado es quien indica (guard garantiza MedicoId).
  const medicoId = usuario?.MedicoId ?? null;

  const set = (k: keyof FormularioReceta) => (v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorForm(null);
    if (!medicoId) {
      setErrorForm('Tu usuario no está vinculado a un médico.');
      return;
    }
    const validacion = validarFormularioReceta(form);
    if (!validacion.ok) {
      setErrorForm(validacion.error);
      return;
    }
    const ok = await r.crear({ ...validacion.dto, IdPaciente: idPaciente, IdMedico: medicoId });
    if (ok) window.scrollTo({ top: 0 });
  };

  if (r.creada) {
    return (
      <div className="page-clinica max-w-xl pt-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">✓</div>
        <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900">Receta registrada</h2>
        <p className="text-sm text-slate-500">
          {r.creada.MedicamentoNombre} · dosis {r.creada.Dosis} · cada {r.creada.Frecuencia} hs
        </p>
        <p className="badge-turno badge-warning mx-auto mt-3 w-fit">
          DISCREPANCIA #7 — Dosis/Frecuencia sin unidad en BD
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to={`/pacientes/${idPaciente}/historia`} className="btn-clinica">
            Ver historia clínica
          </Link>
          <Link to="/agenda" className="btn-clinica-secondary">
            Volver a mi agenda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-clinica max-w-xl">
      <header className="section-clinica">
        <h2 className="section-clinica-title">Nueva receta</h2>
        <p className="section-clinica-subtitle">Paciente #{idPaciente}</p>
      </header>

      <form onSubmit={onSubmit} className="card-clinica space-y-4 p-5" noValidate>
        <CampoSelect
          id="rec-med"
          label="Medicamento"
          placeholder={r.cargandoCatalogo ? 'Cargando…' : 'Elegí…'}
          required
          opciones={r.medicamentos.map((m) => ({ value: String(m.Id), label: m.Nombre }))}
          value={form.IdMedicacion}
          onChange={(e) => set('IdMedicacion')(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoTexto
            id="rec-dosis"
            label="Dosis"
            inputMode="numeric"
            required
            hint="Número entero (unidad PENDIENTE BD #7)"
            value={form.Dosis}
            onChange={(e) => set('Dosis')(e.target.value.replace(/\D/g, ''))}
          />
          <CampoTexto
            id="rec-frec"
            label="Frecuencia (hs)"
            inputMode="numeric"
            required
            hint="Cada cuántas horas (PENDIENTE BD #7)"
            value={form.Frecuencia}
            onChange={(e) => set('Frecuencia')(e.target.value.replace(/\D/g, ''))}
          />
          <CampoTexto id="rec-indicada" label="Indicada (fecha)" type="date" required value={form.Indicada} onChange={(e) => set('Indicada')(e.target.value)} />
          <CampoTexto id="rec-vigencia" label="Vigencia (fecha)" type="date" required value={form.Vigencia} onChange={(e) => set('Vigencia')(e.target.value)} />
        </div>

        {(r.error ?? errorForm) && <span className="error-text">{r.error ?? errorForm}</span>}
        <button type="submit" disabled={r.guardando || !medicoId} className="btn-clinica w-full">
          {r.guardando ? 'Registrando…' : 'Registrar receta'}
        </button>
      </form>
    </div>
  );
}
