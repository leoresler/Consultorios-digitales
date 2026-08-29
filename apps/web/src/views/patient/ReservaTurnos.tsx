import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PublicHeader from '@/components/layout/PublicHeader';
import { CampoSelect, CampoTexto } from '@/components/forms/Campo';
import Stepper from '@/components/ui/Stepper';
import { resumenCuando, useReservaTurno } from '@/controllers/useReservaTurno';
import { mockApi } from '@/services/api';
import type { Result } from '@/types/common';
import { formatFechaLegible, DIAS_CORTOS, diaSemanaDe } from '@/utils/fechas';

/**
 * VIEW (MVC) — wizard de reserva mobile-first.
 * Toda la lógica vive en el controller `useReservaTurno`; aquí solo
 * hay presentación y estado de formulario.
 */

const PASOS_STEPPER = ['Especialidad', 'Profesional', 'Día', 'Horario', 'Datos', 'Confirmar'];

function indiceDePaso(paso: string): number {
  switch (paso) {
    case 'especialidad': return 0;
    case 'profesional':
    case 'consultorio': return 1;
    case 'fecha': return 2;
    case 'horario': return 3;
    case 'identificacion': return 4;
    default: return 5;
  }
}

export default function ReservaTurnos() {
  const r = useReservaTurno();
  const navigate = useNavigate();

  if (r.paso === 'exito' && r.turnoConfirmado) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicHeader />
        <main className="page-clinica max-w-lg">
          <PantallaExito
            nombre={r.turnoConfirmado.PacienteNombreCompleto}
            especialidad={r.turnoConfirmado.EspecialidadNombre}
            medico={r.turnoConfirmado.MedicoNombreCompleto}
            consultorio={r.turnoConfirmado.ConsultorioNombre}
            cuando={resumenCuando(r.turnoConfirmado.Fecha, r.turnoConfirmado.Hora)}
            onOtra={() => {
              r.reiniciar();
              navigate('/reserva');
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="page-clinica mx-auto max-w-2xl">
        <Stepper pasos={PASOS_STEPPER} actual={indiceDePaso(r.paso)} />

        {r.error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {r.error}
          </div>
        )}
        {r.conflictoHorario && (
          <button type="button" className="btn-clinica mb-4 w-full" onClick={() => void r.irAConflicto()}>
            Ver otros horarios disponibles
          </button>
        )}

        {r.paso !== 'especialidad' && (
          <button type="button" className="btn-clinica-ghost mb-3 !px-2" onClick={r.volver}>
            ← Volver
          </button>
        )}

        {r.paso === 'especialidad' && <PasoEspecialidad />}
        {r.paso === 'profesional' && <PasoProfesional />}
        {r.paso === 'consultorio' && <PasoConsultorio />}
        {r.paso === 'fecha' && <PasoFecha />}
        {r.paso === 'horario' && <PasoHorario />}
        {r.paso === 'identificacion' && (
          <PasoIdentificacion
            pacienteNoEncontrado={r.pacienteNoEncontrado}
            identificarPaciente={r.identificarPaciente}
            irARegistro={(tipoDocId, numero) => {
              r.irARegistro(tipoDocId, numero);
              void navigate('/registro');
            }}
          />
        )}
        {r.paso === 'confirmacion' && <PasoConfirmacion />}
      </main>
    </div>
  );

  /* ------------------------- Sub-vistas de presentación ------------------------- */

  function PasoEspecialidad() {
    if (r.cargandoCatalogo) {
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton-clinica h-16" />)}
        </div>
      );
    }
    return (
      <section>
        <Titulo paso="¿Qué especialidad necesitás?" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {r.especialidades.map((e) => (
            <button
              key={e.Id}
              type="button"
              onClick={() => void r.seleccionarEspecialidad(e.Id)}
              className="card-clinica p-4 text-left font-medium text-slate-900 transition hover:border-blue-400 hover:shadow-md"
            >
              {e.Nombre}
              <span className="mt-0.5 block text-xs font-normal text-slate-400">Ver profesionales</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  function PasoProfesional() {
    const esp = r.especialidades.find((e) => e.Id === r.especialidadId);
    return (
      <section>
        <Titulo paso={`Profesionales de ${esp?.Nombre ?? ''}`} />
        {r.cargandoMedicos ? (
          <div className="space-y-3">
            {[0, 1].map((i) => <div key={i} className="skeleton-clinica h-20" />)}
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={!r.medicos.length}
              onClick={() => void r.elegirCualquierMedico()}
              className="card-clinica mb-3 w-full border-blue-200 bg-blue-50 p-4 text-left transition enabled:hover:shadow-md disabled:opacity-50"
            >
              <span className="font-semibold text-blue-700">Cualquier profesional</span>
              <span className="block text-xs text-blue-600/70">Primer profesional disponible</span>
            </button>
            <div className="space-y-3">
              {r.medicos.map((m) => (
                <button
                  key={m.Id}
                  type="button"
                  onClick={() => void r.seleccionarMedico(m.Id)}
                  className="card-clinica flex w-full items-center gap-3 p-4 text-left transition hover:border-blue-400 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {m.NombreCompleto.split(' ').map((s) => s.charAt(0)).slice(0, 2).join('')}
                  </span>
                  <span>
                    <span className="block font-medium text-slate-900">{m.NombreCompleto}</span>
                    <span className="block text-xs text-slate-500">{m.EspecialidadNombre}</span>
                  </span>
                </button>
              ))}
              {!r.medicos.length && !r.error && (
                <p className="text-sm text-slate-500">No hay profesionales con agenda activa.</p>
              )}
            </div>
          </>
        )}
      </section>
    );
  }

  function PasoConsultorio() {
    return (
      <section>
        <Titulo paso="Elegí el consultorio" />
        <div className="space-y-3">
          {r.consultorios.map((c) => (
            <button
              key={c.Id}
              type="button"
              onClick={() => r.seleccionarConsultorio(c.Id)}
              className="card-clinica block w-full p-4 text-left transition hover:border-blue-400 hover:shadow-md"
            >
              <span className="font-medium text-slate-900">{c.Nombre}</span>
              <span className="block text-xs text-slate-500">{c.Direccion}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  function PasoFecha() {
    if (!r.fechasDisponibles.length) {
      return (
        <section>
          <Titulo paso="Elegí el día" />
          <p className="text-sm text-slate-500">
            {r.medico?.NombreCompleto ?? 'Este profesional'} no tiene días habilitados en los próximos 14 días.
          </p>
        </section>
      );
    }
    return (
      <section>
        <Titulo paso="Elegí el día" sub={`${r.medico?.NombreCompleto ?? ''} · próximos ${14} días`} />
        <div className="flex flex-wrap gap-2">
          {r.fechasDisponibles.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => void r.seleccionarFecha(f)}
              className={`rounded-xl border px-4 py-3 text-center transition ${
                f === r.fecha
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'
              }`}
            >
              <span className="block text-[10px] uppercase tracking-wide opacity-70">
                {DIAS_CORTOS[diaSemanaDe(f)]}
              </span>
              <span className="text-sm font-semibold">{f.slice(8, 10)}/{f.slice(5, 7)}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  function PasoHorario() {
    return (
      <section>
        <Titulo
          paso="Elegí el horario"
          sub={r.fecha ? formatFechaLegible(r.fecha) : undefined}
        />
        {r.cargandoSlots ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {Array.from({ length: 10 }, (_, i) => <div key={i} className="skeleton-clinica h-11" />)}
          </div>
        ) : r.slots.length ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {r.slots.map((s) => (
              <button
                key={s.Hora}
                type="button"
                disabled={!s.Disponible}
                onClick={() => r.seleccionarSlot(s.Hora)}
                className={`rounded-xl border py-2.5 text-sm font-medium transition ${
                  !s.Disponible
                    ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 line-through'
                    : s.Hora === r.hora
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-blue-500'
                }`}
              >
                {s.Hora}
              </button>
            ))}
          </div>
        ) : (
          <div className="card-clinica p-6 text-center text-sm text-slate-500">
            No quedan horarios para este día. Probá con otra fecha.
          </div>
        )}
      </section>
    );
  }



  function PasoConfirmacion() {
    const esp = r.especialidades.find((e) => e.Id === r.especialidadId);
    const cons = r.consultorios.find((c) => c.Id === r.consultorioId);
    return (
      <section>
        <Titulo paso="Revisá y confirmá" />
        <div className="card-clinica divide-y divide-slate-100 p-0">
          <Fila etiqueta="Paciente" valor={`${r.paciente?.Nombre} ${r.paciente?.Apellido}`} />
          <Fila etiqueta="Especialidad" valor={esp?.Nombre ?? '—'} />
          <Fila etiqueta="Profesional" valor={r.medico?.NombreCompleto ?? '—'} />
          <Fila etiqueta="Consultorio" valor={cons ? `${cons.Nombre} · ${cons.Direccion}` : '—'} />
          <Fila etiqueta="Fecha" valor={r.fecha ? formatFechaLegible(r.fecha) : '—'} />
          <Fila etiqueta="Hora" valor={r.hora ? `${r.hora} hs` : '—'} />
        </div>
        <button type="button" disabled={r.confirmando} className="btn-clinica mt-4 w-full" onClick={() => void r.confirmar()}>
          {r.confirmando ? 'Confirmando…' : 'Confirmar turno'}
        </button>
        <p className="hint-text text-center">La disponibilidad final la valida el sistema al confirmar.</p>
      </section>
    );
  }
}

/* --------------------------------- Helpers UI --------------------------------- */

function Titulo({ paso, sub }: { paso: string; sub?: string }) {
  return (
    <header className="mb-4">
      <h2 className="text-xl font-bold tracking-tight text-slate-900">{paso}</h2>
      {sub && <p className="mt-0.5 text-sm capitalize text-slate-500">{sub}</p>}
    </header>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 px-5 py-3">
      <span className="text-sm text-slate-500">{etiqueta}</span>
      <span className="text-right text-sm font-medium capitalize text-slate-900">{valor}</span>
    </div>
  );
}

function PantallaExito({
  nombre,
  especialidad,
  medico,
  consultorio,
  cuando,
  onOtra,
}: {
  nombre: string;
  especialidad: string;
  medico: string;
  consultorio: string;
  cuando: string;
  onOtra: () => void;
}) {
  return (
    <section className="pt-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
        ✓
      </div>
      <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">¡Turno confirmado!</h2>
      <p className="mt-1 text-sm text-slate-500">
        Te esperamos, {nombre.split(' ')[0]}.
      </p>

      <div className="card-clinica mt-6 divide-y divide-slate-100 p-0 text-left">
        <Fila etiqueta="Especialidad" valor={especialidad} />
        <Fila etiqueta="Profesional" valor={medico} />
        <Fila etiqueta="Consultorio" valor={consultorio} />
        <Fila etiqueta="Cuándo" valor={cuando} />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link to="/mis-turnos" className="btn-clinica">Ver mis turnos</Link>
        <button type="button" className="btn-clinica-secondary" onClick={onOtra}>
          Reservar otro turno
        </button>
      </div>
    </section>
  );
}

/* ---------- Componentes standalone (fuera del closure de ReservaTurnos) ---------- */

function PasoIdentificacion({
  pacienteNoEncontrado,
  identificarPaciente,
  irARegistro,
}: {
  pacienteNoEncontrado: boolean;
  identificarPaciente: (tipoDocId: number, numero: string) => Promise<boolean>;
  irARegistro: (tipoDocId: number, numero: string) => void;
}) {
  const [tipos, setTipos] = useState<Result<import('@/models').TipoDocumento[]> | null>(null);
  const [tipoDocId, setTipoDocId] = useState('');
  const [numero, setNumero] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let vigente = true;
    mockApi.getTiposDocumento().then((t) => vigente && setTipos(t));
    return () => {
      vigente = false;
    };
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    await identificarPaciente(Number(tipoDocId), numero);
    setEnviando(false);
  };

  return (
    <section>
      <Titulo paso="Identificate" sub="Ingresá tu documento para encontrar tu historia en el sistema." />
      {pacienteNoEncontrado && (
        <div className="card-clinica mb-4 flex items-center justify-between gap-3 border-amber-300 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">¿Primera vez? Registráte en un minuto.</p>
          <button
            type="button"
            className="btn-clinica-secondary !px-3 !py-1.5 text-xs"
            onClick={() => irARegistro(Number(tipoDocId), numero)}
          >
            Registrarme
          </button>
        </div>
      )}
      <form onSubmit={onSubmit} className="card-clinica space-y-4 p-5" noValidate>
        <CampoSelect
          id="tipo-doc"
          label="Tipo de documento"
          placeholder="Elegí…"
          required
          opciones={(tipos?.ok ? tipos.data : []).map((t) => ({ value: String(t.Id), label: t.Nombre }))}
          value={tipoDocId}
          onChange={(e) => setTipoDocId(e.target.value)}
        />
        <CampoTexto
          id="num-doc"
          label="Número de documento"
          inputMode="numeric"
          required
          placeholder="Solo números"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />
        <button type="submit" disabled={enviando || !tipoDocId || !numero} className="btn-clinica w-full">
          {enviando ? 'Buscando…' : 'Continuar'}
        </button>
      </form>
    </section>
  );
}
