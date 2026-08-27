import { Link } from 'react-router-dom';

import { useAgenda } from '@/controllers/useAgenda';
import type { EstadoTurno, TurnoConDetalles } from '@/models';
import { formatFechaLegible } from '@/utils/fechas';

/**
 * VIEW (MVC) — agenda diaria del médico logueado.
 * Navegación por días + turnos con acceso directo a la historia clínica.
 */
export default function AgendaMedico() {
  const a = useAgenda();

  return (
    <div className="page-clinica">
      <header className="section-clinica flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-clinica-title">Mi agenda</h2>
          <p className="section-clinica-subtitle capitalize">{formatFechaLegible(a.fecha)}</p>
        </div>
        <nav className="flex items-center gap-1.5" aria-label="Navegación de fechas">
          <button type="button" className="btn-clinica-ghost !px-3" onClick={a.diaAnterior} aria-label="Día anterior">‹</button>
          <input
            type="date"
            value={a.fecha}
            onChange={(e) => e.target.value && a.setFecha(e.target.value)}
            className="input-clinica !w-auto !py-1.5 text-sm"
            aria-label="Elegir fecha"
          />
          <button
            type="button"
            className={`!px-3 ${a.fecha === new Date().toISOString().slice(0, 10) ? 'btn-clinica-ghost' : 'btn-clinica-secondary'}`}
            onClick={a.irHoy}
          >
            Hoy
          </button>
          <button type="button" className="btn-clinica-ghost !px-3" onClick={a.diaSiguiente} aria-label="Día siguiente">›</button>
        </nav>
      </header>

      {a.error && (
        <div className="card-clinica border-red-200 bg-red-50 p-4 text-sm text-red-700">{a.error}</div>
      )}

      {a.cargando ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton-clinica h-24" />)}
        </div>
      ) : a.turnos.length === 0 ? (
        <div className="card-clinica p-10 text-center text-sm text-slate-500">
          No tenés turnos para este día. 📭
        </div>
      ) : (
        <ul className="space-y-3">
          {a.turnos.map((t) => (
            <TarjetaTurnoAgenda key={t.Id} turno={t} accionOcupada={a.accionId === t.Id} onCompletar={() => void a.completar(t.Id)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TarjetaTurnoAgenda({
  turno: t,
  accionOcupada,
  onCompletar,
}: {
  turno: TurnoConDetalles;
  accionOcupada: boolean;
  onCompletar: () => void;
}) {
  const atendible = t.Estado === 'confirmado' || t.Estado === 'pendiente';
  return (
    <li className="card-clinica flex items-center gap-4 p-4 transition hover:border-blue-300">
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <span className="text-sm font-bold">{t.Hora}</span>
        <span className="text-[10px] uppercase tracking-wide opacity-70">hs</span>
      </div>

      <Link to={`/pacientes/${t.Id_Paciente}/historia`} className="min-w-0 flex-1 group">
        <p className="truncate font-semibold text-slate-900 group-hover:text-blue-700 group-hover:underline">
          {t.PacienteNombreCompleto}
        </p>
        <p className="truncate text-xs text-slate-500">
          {t.PacienteCobertura || 'Sin cobertura'} · Consultorio {t.ConsultorioNombre}
        </p>
        <BadgeEstado estado={t.Estado} />
      </Link>

      <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
        <Link to={`/pacientes/${t.Id_Paciente}/historia`} className="btn-clinica-secondary !px-3 !py-1.5 text-xs">
          Historia
        </Link>
        {atendible && (
          <button
            type="button"
            disabled={accionOcupada}
            className="btn-clinica !px-3 !py-1.5 text-xs"
            onClick={onCompletar}
          >
            {accionOcupada ? '…' : 'Atendido'}
          </button>
        )}
      </div>
    </li>
  );
}

/** MOCK-ONLY (#2): estados simulados client-side. */
function BadgeEstado({ estado }: { estado: EstadoTurno }) {
  const clase =
    estado === 'completado' ? 'badge-info'
    : estado === 'pendiente' ? 'badge-warning'
    : estado === 'cancelado' ? 'badge-danger'
    : 'badge-success';
  return <span className={`badge-turno mt-1.5 inline-block ${clase}`}>{estado}</span>;
}
