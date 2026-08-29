import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { rutaPorRol, useAuth } from '@/controllers/useAuth';

const DEMO_CREDENCIALES = [
  { label: 'Médico', email: 'juan.perez@clinica.com', pass: 'medico123' },
  { label: 'Secretaria', email: 'recepcion@clinica.com', pass: 'recepcion123' },
  { label: 'Admin', email: 'admin@clinica.com', pass: 'admin123' },
];

export default function Login() {
  const { login, ingresando, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const u = await login(email, contrasena);
    if (u) navigate(rutaPorRol(u.Rol), { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-sm hover:bg-blue-700 transition-colors">
            +
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Clínica Médica
          </h1>
          <p className="mt-1 text-sm text-slate-500">Acceso personal interno</p>
        </div>

        <form onSubmit={onSubmit} className="card-clinica space-y-5 p-6 sm:p-8" noValidate>
          <div>
            <label htmlFor="login-email" className="label-clinica">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              required
              className={`input-clinica${error ? ' input-clinica-error' : ''}`}
              placeholder="nombre@clinica.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="login-pass" className="label-clinica">Contraseña</label>
            <input
              id="login-pass"
              type="password"
              autoComplete="current-password"
              required
              className={`input-clinica${error ? ' input-clinica-error' : ''}`}
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
            {error && <span className="error-text">{error}</span>}
          </div>

          <button type="submit" disabled={ingresando} className="btn-clinica w-full">
            {ingresando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <div className="card-clinica mt-4 border-dashed p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Credenciales de prueba (mock)
          </p>
          <ul className="mt-2 space-y-1.5">
            {DEMO_CREDENCIALES.map((c) => (
              <li key={c.email} className="flex items-center justify-between gap-2 text-xs text-slate-600">
                <span><strong className="font-medium">{c.label}:</strong> {c.email}</span>
                <button
                  type="button"
                  className="btn-clinica-ghost !px-2 !py-1 text-xs"
                  onClick={() => {
                    setEmail(c.email);
                    setContrasena(c.pass);
                  }}
                >
                  Usar
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-center text-sm">
          <Link to="/" className="text-slate-500 hover:text-slate-700">← Volver al inicio</Link>
        </p>
      </div>
    </main>
  );
}
