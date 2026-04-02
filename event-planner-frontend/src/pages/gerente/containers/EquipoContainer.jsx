import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, Phone, CreditCard, UserPlus, RefreshCw } from 'lucide-react';
import { useEquipo } from '../hooks/useEquipo';
import GerenteSidebar from '../../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import Header from '../../../layouts/Header/header';
import Footer from '../../../layouts/FooterAsistente/footer';
import PageHeader from '../components/shared/PageHeader';
import NotificationSystem from '../components/shared/NotificationSystem';
import LoadingState from '../components/shared/LoadingState';
import SearchBar from '../components/shared/SearchBar';

const MiembroCard = ({ miembro }) => {
  const nombre = miembro.nombre || miembro.name || 'Sin nombre';
  const correo = miembro.correo || miembro.email || '';
  const cedula = miembro.cedula || '';
  const telefono = miembro.telefono || miembro.phone || '';
  const inicial = nombre[0]?.toUpperCase() ?? '?';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-base font-bold shrink-0">
        {inicial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{nombre}</p>
        {correo && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <Mail size={12} className="shrink-0" />
            <span className="truncate">{correo}</span>
          </div>
        )}
        {cedula && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <CreditCard size={12} className="shrink-0" />
            <span>{cedula}</span>
          </div>
        )}
        {telefono && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <Phone size={12} className="shrink-0" />
            <span>{telefono}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const EquipoContainer = () => {
  const navigate = useNavigate();
  const {
    filteredEquipo,
    equipo,
    loading,
    searchTerm,
    sidebarCollapsed,
    notifications,
    empresaId,
    handleSearchChange,
    handleSidebarToggle,
    closeNotification,
    refetch,
  } = useEquipo();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <LoadingState message="Cargando equipo..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <GerenteSidebar onToggle={handleSidebarToggle} />
      <div className={`shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`} />

      <NotificationSystem notifications={notifications} onClose={closeNotification} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-auto p-6 space-y-5">
          <PageHeader
            title="Equipo de Organizadores"
            subtitle={empresaId ? `Total: ${equipo.length} organizadores` : 'Sin empresa asignada'}
            actionButton={{
              label: 'Nuevo Organizador',
              icon: <UserPlus size={16} />,
              onClick: () => navigate('/gerente/crear-organizador'),
            }}
          />

          {!empresaId ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Users size={48} className="text-slate-300 mb-3" />
              <p className="text-sm font-medium">No hay empresa asignada a tu cuenta.</p>
              <p className="text-xs mt-1">Contacta al administrador para resolver este problema.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <SearchBar
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Buscar por nombre, correo o cédula..."
                  />
                </div>
                <button
                  onClick={refetch}
                  title="Recargar"
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-300 transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {filteredEquipo.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <Users size={48} className="text-slate-300 mb-3" />
                  <p className="text-sm font-medium">
                    {searchTerm ? 'Sin resultados para la búsqueda.' : 'No hay organizadores registrados.'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => navigate('/gerente/crear-organizador')}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
                    >
                      <UserPlus size={15} />
                      Crear primer organizador
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredEquipo.map((miembro, idx) => (
                    <MiembroCard key={miembro.id || miembro._id || idx} miembro={miembro} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default EquipoContainer;
