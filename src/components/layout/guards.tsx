import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

import { useAuth } from '@/controllers/useAuth';
import type { RolMock } from '@/models';

/**
 * GUARD: exige sesión activa. Sin sesión → /login.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * GUARD: restringe por rol (MOCK-ONLY #4 — roles simulados).
 */
export function RequireRol({ roles, children }: { roles: RolMock[]; children: ReactNode }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (!roles.includes(usuario.Rol)) {
    return (
      <div className="card-clinica mx-auto max-w-md p-8 text-center">
        <span className="badge-turno badge-danger mx-auto">Acceso denegado</span>
        <p className="mt-3 text-sm text-slate-600">
          Tu rol no tiene permisos para esta sección.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
