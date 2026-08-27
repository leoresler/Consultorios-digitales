import { Link } from 'react-router-dom';

import PublicHeader from '@/components/layout/PublicHeader';

export default function Landing() {
  return (
    <>
      <PublicHeader />

      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
        <span className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg">
          +
        </span>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Clínica
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-slate-500 sm:text-lg">
          Reservá tu turno online, consultá tus próximas citas y mantené tu historia
          clínica al día.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/reserva" className="btn-clinica w-full sm:w-auto">
            Reservar turno
          </Link>
          <Link to="/mis-turnos" className="btn-clinica-secondary w-full sm:w-auto">
            Mis turnos
          </Link>
        </div>

        <div className="mt-16 border-t border-slate-200 pt-8">
          <Link to="/login" className="text-sm font-medium text-slate-400 transition-colors hover:text-blue-600">
            Soy personal →
          </Link>
        </div>
      </main>
    </>
  );
}
