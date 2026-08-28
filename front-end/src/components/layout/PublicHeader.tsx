import { Link, NavLink } from 'react-router-dom';

/**
 * Header público compartido por las vistas del portal del paciente
 * (no requiere sesión).
 */
export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/reserva" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">+</span>
          <span className="text-sm font-bold tracking-tight text-slate-900">Clínica</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/reserva"
            className={({ isActive }) =>
              `rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            Reservar turno
          </NavLink>
          <NavLink
            to="/mis-turnos"
            className={({ isActive }) =>
              `rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            Mis turnos
          </NavLink>
          <Link to="/login" className="btn-clinica-ghost !px-3 !py-1.5 text-xs sm:text-sm">
            Soy personal
          </Link>
        </nav>
      </div>
    </header>
  );
}
