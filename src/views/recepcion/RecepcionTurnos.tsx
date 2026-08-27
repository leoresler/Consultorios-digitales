import { useState } from 'react';
import { Link } from 'react-router-dom';

import { CampoSelect, CampoTexto } from '@/components/forms/Campo';
import { useAuth } from '@/controllers/useAuth';
import { useRecepcionTurnos } from '@/controllers/useRecepcionTurnos';
import type { EstadoTurno, TurnoConDetalles } from '@/models';
import { formatFechaLegible } from '@/utils/fechas';

/**
 * VIEW (MVC) — recepción: agenda por profesional/fecha con cancelación
 * de turnos y asignación rápida de nuevos turnos a pacientes existentes.
 */
export default function RecepcionTurnos() {
  const r = useRecepcionTurnos();
  const { usuario } = useAuth();
  const puedeVerHistoria = usuario?.Rol === 'medico' || usuario?.Rol === 'admin';
  const medico = r.medicos.find((m) => m.Id === r.medicoId);

  return (
    <div className="page-clinica">
      <header className="section-clinica flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-clinica-title">Gestión de turnos</h2>
          <p className="section-clinica-subtitle capitalize">{formatFechaLegible(r.fecha)}</p>
        </div>
        <nav className="flex items-center gap-1.5" aria-label="Navegación de fechas">
          <button type="button" className="btn-clinica-ghost !px-3" onClick={r.diaAnterior} aria-label="Día anterior">‹</button>
          <input
            type="date"
            value={r.fecha}
            onChange={(e) => e.target.value && r.setFecha(e.target.value)}
            className="input-clinica !w-auto !py-1.5 text-sm"
            aria-label="Elegir fecha"
          />
          <button
            type="button"
            className={`!px-3 ${r.fecha === new Date().toISOString().slice(0, 10) ? 'btn-clinica-ghost' : 'btn-clinica-secondary'}`}
            onClick={r.irHoy}
          >
            Hoy
          </button>
          <button type="button" className="btn-clinica-ghost !px-3" onClick={r.diaSiguiente} aria-label="Día siguiente">›</button>
        </nav>
      </header>

      {/* Selección de profesional (+ consultorio si hay varios) */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoSelect
          id="rec-medico"
          label="Profesional"
          placeholder={r.cargandoMedicos ? 'Cargando…' : 'Elegir profesional…'}
          opciones={r.medicos.map((m) => ({
            value: String(m.Id),
            label: `${m.NombreCompleto} — ${m.EspecialidadNombre}`,
          }))}
          value={r.medicoId ?? ''}
          onChange={(e) => void r.elegirMedico(e.target.value ? Number(e.target.value) : null)}
        />
        {r.consultorios.length > 1 && (
          <CampoSelect
            id="rec-consultorio"
            label="Consultorio"
            placeholder="Elegir consultorio…"
            opciones={r.consultorios.map((c) => ({
              value: String(c.Id),
              label: `${c.Nombre} — ${c.Direccion}`,
            }))}
            value={r.consultorioId ?? ''}
            onChange={(e) => r.elegirConsultorio(e.target.value ? Number(e.target.value) : null)}
          />
        )}
      </div>

      {r.reservado && (
        <div className="card-clinica mb-4 flex flex-wrap items-center justify-between gap-3 border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <span>
            ✅ Turno confirmado: <strong>{r.reservado.PacienteNombreCompleto}</strong> con{' '}
            {r.reservado.MedicoNombreCompleto} · {formatFechaLegible(r.fecha)}{' '}
            {r.reservado.Hora} hs
          </span>
          <button type="button" className="btn-clinica-ghost !px-2 text-xs" onClick={r.cerrarExito}>
            ✕
          </button>
        </div>
      )}

      {r.errorAgenda && (
        <div className="card-clinica border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {r.errorAgenda}
        </div>
      )}

      {!r.medicoId ? (
        <div className="card-clinica p-10 text-center text-sm text-slate-500">
          Elegí un profesional para ver su agenda. 👈
        </div>
      ) : !r.consultorioId && r.consultorios.length === 0 ? (
        <div className="card-clinica p-10 text-center text-sm text-slate-500">
          El profesional no tiene consultorios asignados.
        </div>
      ) : !r.consultorioId ? (
        <div className="card-clinica p-10 text-center text-sm text-slate-500">
          Elegí un consultorio para continuar.
        </div>
      ) : !r.atiendeHoy && !r.cargandoAgenda ? (
        <div className="card-clinica p-10 text-center text-sm text-slate-500">
          {medico?.NombreCompleto} no atiende este día según sus días de atención. 📭
        </div>
      ) : (
        <>
          {/* Agenda del día */}
          {r.cargandoAgenda ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton-clinica h-20" />
              ))}
            </div>
          ) : r.turnos.length === 0 ? (
            <div className="card-clinica p-8 text-center text-sm text-slate-500">
              No hay turnos reservados para este día.
            </div>
          ) : (
            <ul className="space-y-3">
              {r.turnos.map((t) => (
                <TarjetaTurnoRecepcion
                  key={t.Id}
                  turno={t}
                  puedeVerHistoria={puedeVerHistoria}
                  cancelando={r.cancelandoId === t.Id}
                  onCancelar={() => void r.cancelar(t.Id)}
                />
              ))}
            </ul>
          )}

          {/* Asignación rápida */}
          <section className="section-clinica mt-8">
            <h3 className="section-clinica-title text-base">Asignar nuevo turno</h3>
            <p className="section-clinica-subtitle">
              Elegí un horario libre y buscá al paciente por documento.
            </p>

            {r.horasLibres.length === 0 ? (
              <p className="text-sm text-slate-500">No quedan horarios libres para este día.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {r.horasLibres.map((hora) => (
                  <button
                    key={hora}
                    type="button"
                    onClick={() => r.elegirHora(hora)}
                    className={`rounded-lg border px-3 py-1.5 font-mono text-sm transition ${
                      r.horaElegida === hora
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400'
                    }`}
                  >
                    {hora}
                  </button>
                ))}
              </div>
            )}

            {r.horaElegida && (
              <PanelAsignar
                controller={r}
                onCancelarHora={() => r.elegirHora(null)}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}

function TarjetaTurnoRecepcion({
  turno: t,
  puedeVerHistoria,
  cancelando,
  onCancelar,
}: {
  turno: TurnoConDetalles;
  puedeVerHistoria: boolean;
  cancelando: boolean;
  onCancelar(): void;
}) {
  const cancelable = t.Estado === 'confirmado' || t.Estado === 'pendiente';
  return (
    <li className="card-clinica flex items-center gap-4 p-4 transition hover:border-blue-300">
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <span className="text-sm font-bold">{t.Hora}</span>
        <span className="text-[10px] uppercase tracking-wide opacity-70">hs</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900">{t.PacienteNombreCompleto}</p>
        <p className="truncate text-xs text-slate-500">
          {t.PacienteCobertura || 'Sin cobertura'} · Consultorio {t.ConsultorioNombre}
        </p>
        <BadgeEstado estado={t.Estado} />
      </div>

      <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
        {puedeVerHistoria && (
          <Link
            to={`/pacientes/${t.Id_Paciente}/historia`}
            className="btn-clinica-secondary !px-3 !py-1.5 text-xs"
          >
            Historia
          </Link>
        )}
        {cancelable && <BotonCancelar ocupado={cancelando} onConfirmar={onCancelar} />}
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

/** Confirmación en dos clics, igual que el portal del paciente. */
function BotonCancelar({
  ocupado,
  onConfirmar,
}: {
  ocupado: boolean;
  onConfirmar(): void;
}) {
  const [armado, setArmado] = useState(false);
  return (
    <button
      type="button"
      disabled={ocupado}
      onBlur={() => setArmado(false)}
      className={`!px-3 !py-1.5 text-xs ${armado ? 'btn-clinica-danger' : 'btn-clinica-ghost'}`}
      onClick={() => (armado ? onConfirmar() : setArmado(true))}
    >
      {ocupado ? '…' : armado ? '¿Seguro?' : 'Cancelar'}
    </button>
  );
}

/* Panel de identificación del paciente para el horario elegido. */

interface PanelAsignarProps {
  controller: ReturnType<typeof useRecepcionTurnos>;
  onCancelarHora(): void;
}

function PanelAsignar({ controller: c, onCancelarHora }: PanelAsignarProps) {
  const [tipoDocId, setTipoDocId] = useState('');
  const [numero, setNumero] = useState('');

  const buscar = async () => {
    if (!tipoDocId || !numero.trim()) {
      return;
    }
    await c.identificarPaciente(Number(tipoDocId), numero);
    setNumero('');
  };

  return (
    <div className="card-clinica mt-4 space-y-4 border-blue-200 bg-blue-50/50 p-5">
      <h4 className="font-semibold text-slate-900">
        Nuevo turno a las {c.horaElegida} hs
      </h4>

      {c.errorIdentificacion && <p className="error-text" role="alert">{c.errorIdentificacion}</p>}
      {c.errorConfirmar && <p className="error-text" role="alert">{c.errorConfirmar}</p>}

      {!c.pacienteReserva ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
            <CampoSelect
              id="asig-tipo-doc"
              label="Tipo de documento"
              placeholder="Tipo…"
              opciones={c.tiposDocumento.map((t) => ({ value: String(t.Id), label: t.Nombre }))}
              value={tipoDocId}
              onChange={(e) => setTipoDocId(e.target.value)}
            />
            <CampoTexto
              id="asig-numero"
              label="Número de documento"
              inputMode="numeric"
              value={numero}
              onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))}
            />
            <button
              type="button"
              className="btn-clinica-secondary"
              disabled={c.identificando || !tipoDocId || !numero.trim()}
              onClick={() => void buscar()}
            >
              {c.identificando ? 'Buscando…' : 'Buscar paciente'}
            </button>
          </div>
          <p className="hint-text">
            ¿Paciente nuevo? Registrate primero desde{' '}
            <Link to="/recepcion/pacientes" className="font-medium text-blue-700 underline">
              Pacientes
            </Link>
            .
          </p>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-3 text-sm ring-1 ring-slate-200">
            <span className="font-medium text-slate-900">
              {c.pacienteReserva.Nombre} {c.pacienteReserva.Apellido}
              <span className="ml-2 font-normal text-slate-500">
                {c.pacienteReserva.NumeroDocumento ?? 'sin documento'}
                {c.pacienteReserva.Cobertura ? ` · ${c.pacienteReserva.Cobertura}` : ''}
              </span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-clinica-ghost !px-3 text-xs"
                onClick={() => {
                  c.limpiarPacienteReserva();
                  onCancelarHora();
                }}
              >
                Elegir otro horario
              </button>
              <button
                type="button"
                className="btn-clinica !px-3 text-xs"
                disabled={c.confirmando}
                onClick={() => void c.confirmarReserva()}
              >
                {c.confirmando ? 'Confirmando…' : `Confirmar ${c.horaElegida} hs`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
