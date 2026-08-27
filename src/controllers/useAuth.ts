import { useCallback, useContext, useState } from 'react';

import { AuthContext } from '@/app/AuthContext';
import type { UsuarioAutenticado } from '@/models';
import { mockApi } from '@/services/api';

/**
 * CONTROLLER (MVC) — lógica de autenticación interna.
 *
 * MOCK-ONLY (#4): la BD no modela roles ni tokens reales. La sesión vive
 * en localStorage y el rol lo asigna el mock. Al llegar NestJS esto se
 * reemplaza por JWT/cookie sin tocar las Views.
 */

const STORAGE_KEY = 'clinica.sesion.v1';

function leerSesion(): UsuarioAutenticado | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UsuarioAutenticado) : null;
  } catch {
    return null;
  }
}

export interface AuthEstado {
  usuario: UsuarioAutenticado | null;
  /** True mientras hay un login en curso. */
  ingresando: boolean;
  /** Mensaje de error del último intento (null si no hubo). */
  error: string | null;
  /** Resuelve el usuario autenticado, o null si falló. */
  login(Email: string, Contrasena: string): Promise<UsuarioAutenticado | null>;
  cerrarSesion(): void;
}

export function useAuthController(): AuthEstado {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(leerSesion);
  const [ingresando, setIngresando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (Email: string, Contrasena: string): Promise<UsuarioAutenticado | null> => {
      setIngresando(true);
      setError(null);
      const resultado = await mockApi.login(Email, Contrasena);
      setIngresando(false);
      if (!resultado.ok) {
        setError(resultado.error.mensaje);
        return null;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resultado.data));
      setUsuario(resultado.data);
      return resultado.data;
    },
    [],
  );

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUsuario(null);
  }, []);

  return { usuario, ingresando, error, login, cerrarSesion };
}

/** Acceso público al controller desde cualquier View. */
export function useAuth(): AuthEstado {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
}

/** Ruta inicial según el rol (MOCK-ONLY hasta existir roles en BD). */
export function rutaPorRol(rol: UsuarioAutenticado['Rol']): string {
  return rol === 'medico' ? '/agenda' : '/recepcion/pacientes';
}
