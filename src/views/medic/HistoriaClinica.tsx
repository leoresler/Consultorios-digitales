import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { CampoTexto } from '@/components/forms/Campo';
import { useAuth } from '@/controllers/useAuth';
import { useHistoriaClinica } from '@/controllers/useHistoriaClinica';
import type { NuevaAtencionDTO } from '@/models';
import { mockApi } from '@/services/api';
import type { Result } from '@/types/common';
import type { TipoEstudio } from '@/models';
import { useEffect } from 'react';
import { formatFechaLegible, hoyISO } from '@/utils/fechas';

/**
 * VIEW (MVC) — historia clínica del paciente (timeline) + alta
 * "Nueva Atención".
 *
 * DISCREPANCIAS #3: sin motivo/diagnóstico en el modelo; la atención se
 * registra como estudio con tipo obligatorio. La UI lo aclara al usuario.
 */
export default function HistoriaClinicaView() {
  const params = useParams();
  const idPaciente = Number(params.idPaciente) || null;
  const { usuario } = useAuth();

  return (
    <div className="page-clinica">
      <Encabezado idPaciente={idPaciente} medicoId={usuario?.MedicoId ?? null} />
    </div>
  );
}

function Encabezado({ idPaciente, medicoId }: { idPaciente: number | null; medicoId: number | null }) {
  const h = useHistoriaClinica(idPaciente, medicoId);
  const [formAbierto, setFormAbierto] = useState(false);

  if (!idPaciente || h.error) {
    return (
      <div className="card-clinica border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {h.error ?? 'Paciente no válido.'}
      </div>
    );
  }

  return (
    <>
      <header className="section-clinica flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-clinica-title capitalize">
            Historia clínica · {h.paciente?.Nombre} {h.paciente?.Apellido}
          </h2>
          <p className="section-clinica-subtitle">
            Paciente #{idPaciente}
            {h.paciente?.Cobertura ? ` · ${h.paciente.Cobertura}` : ''}
          </p>
        </div>
        <button
          type="button"
          className={formAbierto ? 'btn-clinica-ghost' : 'btn-clinica'}
          onClick={() => setFormAbierto((v) => !v)}
        >
          {formAbierto ? 'Cancelar' : '+ Nueva atención'}
        </button>
      </header>

      {formAbierto && (
        <FormularioNuevaAtencion
          guardando={h.guardando}
          errorGuardado={h.errorGuardado}
          onGuardar={(dto) => {
            const ok = h.crearAtencion(dto);
            void ok.then((exito) => {
              if (exito) setFormAbierto(false);
            });
            return ok;
          }}
        />
      )}

      <Timeline entradas={h.entradas} cargando={h.cargando} />
    </>
  );
}

function FormularioNuevaAtencion({
  guardando,
  errorGuardado,
  onGuardar,
}: {
  guardando: boolean;
  errorGuardado: string | null;
  onGuardar: (dto: Omit<NuevaAtencionDTO, 'IdPaciente' | 'IdMedico'>) => Promise<boolean>;
}) {
  const [estudios, setEstudios] = useState<Result<TipoEstudio[]> | null>(null);
  const [tipoEstudioId, setTipoEstudioId] = useState('');
  const [fecha, setFecha] = useState(hoyISO());
  const [documentos, setDocumentos] = useState('');
  const [resultados, setResultados] = useState('');

  useEffect(() => {
    let vigente = true;
    mockApi.getTiposEstudio().then((t) => vigente && setEstudios(t));
    return () => {
      vigente = false;
    };
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!tipoEstudioId) return;
    void onGuardar({
      IdTipoEstudio: Number(tipoEstudioId),
      FechaRealizacion: fecha,
      Documentos: documentos.trim() || null,
      Resultados: resultados.trim() || null,
    });
  };

  return (
    <form onSubmit={onSubmit} className="card-clinica mb-6 space-y-4 border-blue-200 bg-blue-50/40 p-5" noValidate>
      <p className="badge-turno badge-warning w-fit">
        DISCREPANCIA #3 — el modelo actual solo admite atenciones como estudios
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="hc-tipo" className="label-clinica">Tipo de estudio / consulta *</label>
          <select
            id="hc-tipo"
            required
            value={tipoEstudioId}
            onChange={(e) => setTipoEstudioId(e.target.value)}
            className="input-clinica"
          >
            <option value="">Elegí…</option>
            {(estudios?.ok ? estudios.data : []).map((te) => (
              <option key={te.Id} value={String(te.Id)}>{te.Nombre}</option>
            ))}
          </select>
        </div>
        <CampoTexto id="hc-fecha" label="Fecha de realización" type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <CampoTexto id="hc-docs" label="Documentación (texto)" placeholder="Ej.: análisis solicitado…" value={documentos} onChange={(e) => setDocumentos(e.target.value)} hint="PENDIENTE BD #6: columna sin tipo declarado" />
        <CampoTexto id="hc-res" label="Resultados / observaciones (texto)" placeholder="Ej.: valores dentro de rango…" value={resultados} onChange={(e) => setResultados(e.target.value)} hint="PENDIENTE BD #6: columna sin tipo declarado" />
      </div>
      {errorGuardado && <span className="error-text">{errorGuardado}</span>}
      <button type="submit" disabled={guardando || !tipoEstudioId} className="btn-clinica">
        {guardando ? 'Guardando…' : 'Registrar atención'}
      </button>
    </form>
  );
}

function Timeline({ entradas, cargando }: { entradas: import('@/models').EntradaTimeline[]; cargando: boolean }) {
  if (cargando) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => <div key={i} className="skeleton-clinica h-28" />)}
      </div>
    );
  }
  if (!entradas.length) {
    return (
      <div className="card-clinica p-10 text-center text-sm text-slate-500">
        El paciente todavía no tiene registros clínicos.
      </div>
    );
  }
  return (
    <ol className="timeline-clinica">
      {entradas.map((entrada) => (
        <li key={entrada.Id} className="timeline-punto pb-8">
          <article className="card-clinica p-5">
            <header className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{entrada.TipoEstudioNombre}</h3>
              <span className="text-xs capitalize text-slate-400">{formatFechaLegible(entrada.FechaRealizacion)}</span>
            </header>
            <p className="mt-0.5 text-xs text-slate-500">Dr/a. {entrada.MedicoNombreCompleto}</p>

            {entrada.Resultados && (
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{entrada.Resultados}</p>
            )}
            {entrada.Documentos && (
              <p className="mt-2 text-xs text-slate-500">📄 Documentación: {entrada.Documentos}</p>
            )}

            {entrada.Adjuntos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {entrada.Adjuntos.map((adj) => (
                  <a
                    key={adj.Id}
                    href={adj.Archivo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
                  >
                    📎 {nombreArchivo(adj.Archivo)}
                  </a>
                ))}
              </div>
            )}

            {entrada.RecetasRelacionadas.length > 0 && (
              <Link
                to="/recetas/nueva"
                className="hint-text mt-3 block"
                title="MOCK-ONLY (#9): correlación heurística por médico y ±30 días"
              >
                💊 Receta(s) relacionada(s) a esta atención ({entrada.RecetasRelacionadas.length}) — MOCK-ONLY #9
              </Link>
            )}
          </article>
        </li>
      ))}
    </ol>
  );
}

function nombreArchivo(url: string): string {
  return url.split('/').pop() ?? url;
}
