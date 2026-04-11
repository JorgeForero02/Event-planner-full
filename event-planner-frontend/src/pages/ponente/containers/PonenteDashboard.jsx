import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { usePonenteAgenda } from '../hooks/usePonenteAgenda';
import { useEventosActividadesAceptadas } from '../hooks/useEventosActividadesAceptadas';
import Sidebar from '../../../layouts/Sidebar/sidebarPonente/sidebar';
import Header from '../../../layouts/Header/header';
import DashboardSection from '../components/sections/DashboardSection';
import EventosSection from '../components/sections/EventosSection';
import AgendaSection from '../components/sections/AgendaSection';
import MisActividadesSection from '../components/sections/MisActividadesSection';
import EncuestasSection from '../components/sections/EncuestasSection';

const PATH_TO_VIEW = {
  '/ponente':             'dashboard',
  '/ponente/eventos':     'eventos',
  '/ponente/actividades': 'actividades',
  '/ponente/encuestas':   'encuestas',
};

const PonenteDashboard = () => {
  const location = useLocation();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);

  const currentView = PATH_TO_VIEW[location.pathname] ?? 'dashboard';

  const { user } = useAuth();

  const { actividades, loading, error, refetch } = usePonenteAgenda();

  const {
    eventos: eventosAceptados,
    loading: loadingEventos,
    error: errorEventos
  } = useEventosActividadesAceptadas();

  const obtenerIdPonente = () => {
    if (!user) return null;
    if (user.rol === 'ponente' && user.rolData?.id_ponente) {
      return user.rolData.id_ponente;
    }
    return null;
  };

  const ponenteId = obtenerIdPonente();

  const renderSection = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardSection actividades={actividades} loading={loading} />;
      case 'eventos':
        return <EventosSection onEventoSelect={setSelectedEvento} />;
      case 'agenda':
        return <AgendaSection evento={selectedEvento} />;
      case 'actividades':
        return <MisActividadesSection actividades={actividades} onSolicitudEnviada={refetch} error={error} />;
      case 'encuestas':
        return <EncuestasSection
          eventos={eventosAceptados || []}
          loadingEventos={loadingEventos}
          errorEventos={errorEventos}
          ponenteId={ponenteId}
        />;
      default:
        return <DashboardSection actividades={actividades} loading={loading} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onToggle={(collapsed) => setIsMenuCollapsed(collapsed)} />
      <div className={`flex-1 flex flex-col transition-[margin-left] duration-300 ${isMenuCollapsed ? 'ml-[80px]' : 'ml-[250px]'}`}>
        <Header isMenuCollapsed={isMenuCollapsed} />
        <div className="flex-1 p-5 overflow-y-auto bg-slate-50">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default PonenteDashboard;