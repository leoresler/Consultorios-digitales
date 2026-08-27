import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '@/controllers/useAuth';
import type { RolMock } from '@/models';

interface ItemNav {
  to: string;
  label: string;
  icono: string;
  roles: RolMock[];
}

const NAV: ItemNav[] = [
  { to: '/agenda', label: 'Mi agenda', icono: '📅', roles: ['medico'] },
  { to: '/recepcion/pacientes', label: 'Pacientes', icono: '🧑‍🤝‍🧑', roles: ['recepcion', 'admin'] },
  { to: '/recepcion/turnos', label: 'Turnos', icono: '🗓️', roles: ['recepcion', 'admin'] },
];

const ETIQUETA_ROL: Record<RolMock, string> = {
  medico: 'Médico',
  recepcion: 'Secretaria',
  admin: 'Administrador',
};

function iniciales(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

export default function AppShell() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  if (!usuario) return null;
  const items = NAV.filter((i) => i.roles.includes(usuario.Rol));

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-6 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">+</span>
          <span className="text-base font-bold tracking-tight text-slate-900">Clínica</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 font-semibold text-blue-700'
                    : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span aria-hidden>{item.icono}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {iniciales(usuario.Nombre, usuario.Apellido)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {usuario.Nombre} {usuario.Apellido}
              </p>
              <span className="badge-turno badge-info mt-0.5">{ETIQUETA_ROL[usuario.Rol]}</span>
            </div>
            <button
              type="button"
              title="Cerrar sesión"
              className="btn-clinica-ghost !px-2 !py-1.5"
              onClick={() => {
                cerrarSesion();
                navigate('/login', { replace: true });
              }}
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* Columna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar mobile */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">+</span>
            <span className="text-sm font-bold text-slate-900">Clínica</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-turno badge-info">{ETIQUETA_ROL[usuario.Rol]}</span>
            <button
              type="button"
              title="Cerrar sesión"
              className="btn-clinica-ghost !px-2 !py-1"
              onClick={() => {
                cerrarSesion();
                navigate('/login', { replace: true });
              }}
            >
              ⏻
            </button>
          </div>
        </header>

        {/* Nav horizontal mobile */}
        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="page-clinica flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
