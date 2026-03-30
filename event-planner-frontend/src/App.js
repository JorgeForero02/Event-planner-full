import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Dashboard from './components/Dashboard';
import Admin from './pages/admin/admin';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
// [FRONTEND-SYNC] F2: Importar nuevos route guards por rol
import GerenteRoute from './components/GerenteRoute';
import OrganizadorRoute from './components/OrganizadorRoute';
import PonenteRoute from './components/PonenteRoute';
import AsistenteRoute from './components/AsistenteRoute';
import Empresa from './pages/empresa/empresa';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/auth/register';
import ForgotPassword from './pages/ForgotPassword';
import GerenteDashboard from './pages/gerente/containers/GerenteDashboard';
import ActualizarEmpresa from './pages/empresa/ActualizarEmpresa';
import AfiliacionesAprobadas from './pages/admin/components/sections/AfiliacionesAprobadasSection';
import AfiliacionesPendientes from './pages/admin/components/sections/AfiliacionesPendientesSection';
import AfiliacionesRechazadas from './pages/admin/components/sections/AfiliacionesRechazadasSection';
import EventosContainer from './pages/gerente/containers/EventosContainer';
import CrearOrganizadorContainer from './pages/gerente/containers/CrearOrganizadorContainer';
import UbicacionesContainer from './pages/gerente/containers/UbicacionesContainer';
import LugaresContainer from './pages/gerente/containers/LugaresContainer';
import EditarEventoPage from './pages/organizador/Eventos/EditarEventoPage';
import Asistente from './pages/asistente/AsistentePanel';

import OrganizerDashboard from './pages/organizador/OrganizerDashboard';
import PonenteDashboard from './pages/ponente/containers/PonenteDashboard';
import CrearEventoPage from './pages/organizador/Eventos/CrearEventoPage';
import GestionarAgendaPage from './pages/organizador/Agenda/GestionarAgendaPage';
import CrearActividadPage from './pages/organizador/Actividades/CrearActividadPage';
import EditarActividadPage from './pages/organizador/Actividades/EditarActividadPage';
import ActividadesPage from './pages/organizador/Actividades/ActividadesPage';
import EventosPageOrganizador from './pages/organizador/Eventos/EventosPageOrganizador';
import GestionAsistentes from './pages/organizador/asistencia';
import EstadisticasAsistencia from './pages/organizador/EstadisticasAsistencia';
import OrganizadorNotificaciones from './pages/organizador/Notificaciones/OrganizadorNotificaciones';
import EncuestasManager from './pages/organizador/Encuestas/EncuestasManager';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Ruta protegida */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login-admin" element={<AdminLogin />} />

          {/* Ruta del panel de administración */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          {/* Rutas de Gerente — protegidas por GerenteRoute (F2) */}
          <Route
            path="/gerente"
            element={
              <GerenteRoute>
                <GerenteDashboard />
              </GerenteRoute>
            }
          />
          <Route
            path="/gerente/crear-organizador"
            element={
              <GerenteRoute>
                <CrearOrganizadorContainer />
              </GerenteRoute>
            }
          />
          <Route
            path="/gerente/ubicaciones"
            element={
              <GerenteRoute>
                <UbicacionesContainer />
              </GerenteRoute>
            }
          />
          <Route
            path="/gerente/lugares"
            element={
              <GerenteRoute>
                <LugaresContainer />
              </GerenteRoute>
            }
          />
          <Route
            path="/gerente/eventos"
            element={
              <GerenteRoute>
                <EventosContainer />
              </GerenteRoute>
            }
          />
          <Route
            path="/gerente/actualizar-empresa"
            element={
              <GerenteRoute>
                <ActualizarEmpresa />
              </GerenteRoute>
            }
          />

          {/* Rutas para Asistente — protegidas por AsistenteRoute (F2) */}
          <Route
            path="/asistente/*"
            element={
              <AsistenteRoute>
                <Asistente />
              </AsistenteRoute>
            }
          />

          {/* Rutas específicas del asistente para mantener compatibilidad */}
          <Route
            path="/asistente/dashboard"
            element={
              <AsistenteRoute>
                <Asistente />
              </AsistenteRoute>
            }
          />
          <Route
            path="/asistente/eventos"
            element={
              <AsistenteRoute>
                <Asistente />
              </AsistenteRoute>
            }
          />
          <Route
            path="/asistente/agenda"
            element={
              <AsistenteRoute>
                <Asistente />
              </AsistenteRoute>
            }
          />
          <Route
            path="/asistente/inscripciones"
            element={
              <AsistenteRoute>
                <Asistente />
              </AsistenteRoute>
            }
          />
          <Route
            path="/asistente/empresa"
            element={
              <AsistenteRoute>
                <Empresa />
              </AsistenteRoute>
            }
          />

          {/* Ruta para gestión de empresa — protegidas por GerenteRoute (F2) */}
          <Route
            path="/empresa"
            element={
              <GerenteRoute>
                <Empresa />
              </GerenteRoute>
            }
          />

          {/* Rutas para gestión de afiliaciones */}
          <Route
            path="/empresa/afiliaciones-aprobadas"
            element={
              <GerenteRoute>
                <AfiliacionesAprobadas />
              </GerenteRoute>
            }
          />
          <Route
            path="/empresa/afiliaciones-pendientes"
            element={
              <GerenteRoute>
                <AfiliacionesPendientes />
              </GerenteRoute>
            }
          />
          <Route
            path="/empresa/afiliaciones-rechazadas"
            element={
              <GerenteRoute>
                <AfiliacionesRechazadas />
              </GerenteRoute>
            }
          />

          {/* Rutas Organizador — protegidas por OrganizadorRoute (F1+F2) */}
          <Route
            path="/organizador"
            element={
              <OrganizadorRoute>
                <OrganizerDashboard />
              </OrganizadorRoute>
            }
          />
          <Route
            path="/organizador/eventos"
            element={
              <OrganizadorRoute>
                <EventosPageOrganizador />
              </OrganizadorRoute>
            }
          />
          <Route
            path="/organizador/eventos/crear"
            element={
              <OrganizadorRoute>
                <CrearEventoPage />
              </OrganizadorRoute>
            }
          />
          <Route
            path="/organizador/eventos/editar/:id"
            element={
              <OrganizadorRoute>
                <EditarEventoPage />
              </OrganizadorRoute>
            }
          />
          <Route
            path="/organizador/eventos/:eventoId/agenda"
            element={
              <OrganizadorRoute>
                <GestionarAgendaPage />
              </OrganizadorRoute>
            }
          />
          <Route
            path="/organizador/eventos/:eventoId/actividades/crear"
            element={
              <OrganizadorRoute>
                <CrearActividadPage />
              </OrganizadorRoute>
            }
          />
          <Route
            path="/organizador/actividades/:idActividad/editar"
            element={
              <OrganizadorRoute>
                <EditarActividadPage />
              </OrganizadorRoute>
            }
          />
          <Route
            path="/organizador/agenda"
            element={
              <OrganizadorRoute>
                <ActividadesPage />
              </OrganizadorRoute>
            }
          />
          <Route
            path="/organizador/reportes"
            element={
              <OrganizadorRoute>
                <EstadisticasAsistencia />
              </OrganizadorRoute>
            }
          />
          <Route
            path="/organizador/encuestas"
            element={
              <OrganizadorRoute>
                <EncuestasManager />
              </OrganizadorRoute>
            }
          />
          <Route
            path="/organizador/asistentes"
            element={
              <OrganizadorRoute>
                <GestionAsistentes />
              </OrganizadorRoute>
            }
          />
          <Route
            path="/organizador/notificaciones"
            element={
              <OrganizadorRoute>
                <OrganizadorNotificaciones />
              </OrganizadorRoute>
            }
          />

          {/* Rutas Ponente — protegidas por PonenteRoute (F2) */}
          <Route
            path="/ponente"
            element={
              <PonenteRoute>
                <PonenteDashboard />
              </PonenteRoute>
            }
          />
          <Route
            path="/ponente/dashboard"
            element={
              <PonenteRoute>
                <PonenteDashboard />
              </PonenteRoute>
            }
          />
          <Route
            path="/ponente/eventos"
            element={
              <PonenteRoute>
                <PonenteDashboard />
              </PonenteRoute>
            }
          />
          <Route
            path="/ponente/agenda"
            element={
              <PonenteRoute>
                <PonenteDashboard />
              </PonenteRoute>
            }
          />
          <Route
            path="/ponente/actividades"
            element={
              <PonenteRoute>
                <PonenteDashboard />
              </PonenteRoute>
            }
          />
          {/* Ruta por defecto */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          {/* Ruta 404 - Página no encontrada */}
          <Route
            path="*"
            element={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>404 - Página no encontrada</h2>
                <p>La página que buscas no existe.</p>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;