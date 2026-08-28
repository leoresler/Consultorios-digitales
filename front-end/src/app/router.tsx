import { Navigate, Route, Routes } from 'react-router-dom';

import AppShell from '@/components/layout/AppShell';
import { RequireAuth, RequireRol } from '@/components/layout/guards';
import { rutaPorRol, useAuth } from '@/controllers/useAuth';
import Login from '@/views/auth/Login';
import RegistroPaciente from '@/views/auth/RegistroPaciente';
import DashboardPaciente from '@/views/patient/DashboardPaciente';
import ReservaTurnos from '@/views/patient/ReservaTurnos';
import Landing from '@/views/public/Landing';
import AgendaMedico from '@/views/medic/AgendaMedico';
import HistoriaClinicaView from '@/views/medic/HistoriaClinica';
import NuevaReceta from '@/views/medic/NuevaReceta';
import RecepcionPacientes from '@/views/recepcion/RecepcionPacientes';
import RecepcionTurnos from '@/views/recepcion/RecepcionTurnos';

function InicioLogueado() {
  const { usuario } = useAuth();
  return <Navigate to={usuario ? rutaPorRol(usuario.Rol) : '/login'} replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<RegistroPaciente />} />
      <Route path="/reserva" element={<ReservaTurnos />} />
      <Route path="/mis-turnos" element={<DashboardPaciente />} />

      {/* Rutas protegidas (requieren sesión) */}
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/inicio" element={<InicioLogueado />} />

        {/* Portal médico */}
        <Route
          path="/agenda"
          element={
            <RequireRol roles={['medico']}>
              <AgendaMedico />
            </RequireRol>
          }
        />
        <Route
          path="/pacientes/:idPaciente/historia"
          element={
            <RequireRol roles={['medico', 'admin']}>
              <HistoriaClinicaView />
            </RequireRol>
          }
        />
        <Route
          path="/recetas/nueva/:idPaciente?"
          element={
            <RequireRol roles={['medico']}>
              <NuevaReceta />
            </RequireRol>
          }
        />

        {/* Recepción */}
        <Route
          path="/recepcion/pacientes"
          element={
            <RequireRol roles={['recepcion', 'admin']}>
              <RecepcionPacientes />
            </RequireRol>
          }
        />
        <Route
          path="/recepcion/turnos"
          element={
            <RequireRol roles={['recepcion', 'admin']}>
              <RecepcionTurnos />
            </RequireRol>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
