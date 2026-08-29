import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { CampoSelect, CampoTexto } from '@/components/forms/Campo';
import PublicHeader from '@/components/layout/PublicHeader';
import { useTurnos } from '@/controllers/useTurnos';
import type { TurnoConDetalles } from '@/models';
import type { Result } from '@/types/common';
import { mockApi } from '@/services/api';
import { formatFechaLegible } from '@/utils/fechas';

/**
 * VIEW (MVC) — "Mis turnos": identificación por documento y listado
 * de turnos pasados/futuros con cancelación.
 */
export default function DashboardPaciente() {
  const p = useTurnos();

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="page-clinica mx-auto max-w-2xl">
        {!p.paciente ? (
          <PanelIdentificacion />
        ) : (
          <>
            <header className="section-clinica flex items-start justify-between gap-3">
              <div>
                <h2 className="section-clinica-title">
                  Hola, {p.paciente.Nombre} 👋
                </h2>
                <p className="section-clinica-subtitle">
                  Cobertura: {p.paciente.Cobertura}
                </p>
              </div>
              <button type="button" className="btn-clinica-secondary !px-3 !py-1.5 text-xs" onClick={p.salir}>
                No soy yo
              </button>
            </header>
            <ListadoTurnos />
          </>
        )}
      </main>
    </div>
  );

  function PanelIdentificacion() {
    const [tipos, setTipos] = useState<Result<import('@/models').TipoDocumento[]> | null>(null);
    const [tipoDocId, setTipoDocId] = useState('');
    const [numero, setNumero] = useState('');

    useEffect(() => {
      let vigente = true;
      mockApi.getTiposDocumento().then((t) => {
        if (vigente) setTipos(t);
      });
      return () => {
        vigente = false;
      };
    }, []);

    const onSubmit = (e: FormEvent) => {
      e.preventDefault();
      void p.identificar(Number(tipoDocId), numero);
    };

    return (
      <section className="mx-auto max-w-md pt-6">
        <Titulo paso="Mis turnos" sub="Identificate con tu documento para ver tus turnos." />
        <form onSubmit={onSubmit} className="card-clinica space-y-4 p-5" noValidate>
          <CampoSelect
            id="mi-tipo-doc"
            label="Tipo de documento"
            placeholder="Elegí…"
            required
            opciones={(tipos?.ok ? tipos.data : []).map((t) => ({ value: String(t.Id), label: t.Nombre }))}
            value={tipoDocId}
            onChange={(e) => setTipoDocId(e.target.value)}
          />
          <CampoTexto
            id="mi-num-doc"
            label="Número de documento"
            inputMode="numeric"
            required
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
          {p.errorIdentificacion && <span className="error-text">{p.errorIdentificacion}</span>}
          <button type="submit" disabled={p.identificando || !tipoDocId || !numero} className="btn-clinica w-full">
            {p.identificando ? 'Buscando…' : 'Ver mis turnos'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-500">
          ¿Todavía no tenés turnos?{' '}
          <Link to="/reserva" className="font-medium text-blue-600 hover:underline">
            Reservá el primero
          </Link>
        </div>
      </section>
    );
  }

  function ListadoTurnos() {
    if (p.cargandoTurnos) {
      return (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton-clinica h-24" />)}
        </div>
      );
    }
    if (p.errorTurnos) {
      return <div className="card-clinica border-red-200 bg-red-50 p-4 text-sm text-red-700">{p.errorTurnos}</div>;
    }
    const hoy = new Date();
    const esFuturo = (t: TurnoConDetalles) =>
      t.Estado !== 'cancelado' &&
      new Date(`${t.Fecha}T${t.Hora}:00`) >= hoy;

    const futuros = p.turnos.filter(esFuturo);
    const historial = p.turnos.filter((t) => !esFuturo(t));

    return (
      <div className="space-y-8">
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Próximos</h3>
          {futuros.length ? (
            <div className="space-y-3">
              {futuros.map((t) => (
                <TarjetaTurno key={t.Id} turno={t}>
                  {t.Estado !== 'cancelado' && (
                    <BotonCancelar id={t.Id} />
                  )}
                </TarjetaTurno>
              ))}
            </div>
          ) : (
            <div className="card-clinica p-6 text-center text-sm text-slate-500">
              No tenés turnos próximos.{' '}
              <Link to="/reserva" className="font-medium text-blue-600 hover:underline">Reservar uno</Link>
            </div>
          )}
        </section>

        {historial.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Historial</h3>
            <div className="space-y-3 opacity-80">
              {historial.map((t) => (
                <TarjetaTurno key={t.Id} turno={t} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  function TarjetaTurno({ turno: t, children }: { turno: TurnoConDetalles; children?: React.ReactNode }) {
    return (
      <article className="card-clinica flex items-center gap-4 p-4">
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <span className="text-[10px] font-semibold uppercase">{t.Fecha.slice(8, 10)}/{t.Fecha.slice(5, 7)}</span>
          <span className="text-sm font-bold">{t.Hora}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold capitalize text-slate-900">
            {formatFechaLegible(t.Fecha)} · {t.EspecialidadNombre}
          </p>
          <p className="truncate text-xs text-slate-500">
            {t.MedicoNombreCompleto} · {t.ConsultorioNombre}
          </p>
          <span className={`badge-turno mt-1.5 ${claseBadge(t.Estado)}`}>{etiquetaBadge(t.Estado)}</span>
        </div>
        {children}
      </article>
    );
  }

  function BotonCancelar({ id }: { id: number }) {
    const [confirmando, setConfirmando] = useState(false);
    if (!confirmando) {
      return (
        <button type="button" className="btn-clinica-danger !px-3 !py-1.5 text-xs" onClick={() => setConfirmando(true)}>
          Cancelar
        </button>
      );
    }
    return (
      <div className="flex shrink-0 flex-col gap-1">
        <button
          type="button"
          disabled={p.cancelandoId === id}
          className="btn-clinica-danger !px-3 !py-1 text-xs"
          onClick={() => void p.cancelar(id).then(() => setConfirmando(false))}
        >
          {p.cancelandoId === id ? 'Cancelando…' : 'Confirmar'}
        </button>
        <button type="button" className="text-xs text-slate-400 hover:text-slate-600" onClick={() => setConfirmando(false)}>
          No
        </button>
      </div>
    );
  }
}

function Titulo({ paso, sub }: { paso: string; sub?: string }) {
  return (
    <header className="mb-4">
      <h2 className="text-xl font-bold tracking-tight text-slate-900">{paso}</h2>
      {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
    </header>
  );
}

/** MOCK-ONLY (#2): mapeo visual de estados simulados client-side. */
function claseBadge(e: TurnoConDetalles['Estado']): string {
  switch (e) {
    case 'confirmado': return 'badge-success';
    case 'pendiente': return 'badge-warning';
    case 'cancelado': return 'badge-danger';
    default: return 'badge-info';
  }
}

function etiquetaBadge(e: TurnoConDetalles['Estado']): string {
  const mapa: Record<TurnoConDetalles['Estado'], string> = {
    confirmado: 'Confirmado',
    pendiente: 'Pendiente',
    cancelado: 'Cancelado',
    completado: 'Completado',
  };
  return mapa[e];
}
