import React from 'react';
import { useEvents } from '../hooks/useEvents';
import GerenteSidebar from '../../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import Header from '../../../layouts/Header/header';
import Footer from '../../../layouts/FooterAsistente/footer';
import PageHeader from '../components/shared/PageHeader';
import EventFilters from '../components/forms/EventFilters';
import EventsList from '../components/lists/EventsList';
import EventDetailsModal from '../components/modals/EventDetailsModal';
import NotificationSystem from '../components/shared/NotificationSystem';
import LoadingState from '../components/shared/LoadingState';

const EventosContainer = () => {
    const {
        eventos,
        eventosFiltrados,
        organizadores,
        searchTerm,
        filtroOrganizador,
        loading,
        sidebarCollapsed,
        showModal,
        eventoSeleccionado,
        verDetallesEvento,
        cerrarModal,
        handleSearchChange,
        handleOrganizadorFilterChange,
        handleSidebarToggle,
        limpiarFiltros,
        formatFecha,
        formatHora,
        getLugarTexto,
        getEstadoEvento,
        notifications,
        closeNotification
    } = useEvents();

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50 items-center justify-center">
                <LoadingState message="Cargando eventos..." />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <GerenteSidebar onToggle={handleSidebarToggle} />
            <div className={`shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`} />

            <NotificationSystem
                notifications={notifications}
                onClose={closeNotification}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header />

                <main className="flex-1 overflow-auto p-6 space-y-5">
                    <PageHeader
                        title="Eventos"
                        subtitle={`Total: ${eventos.length} eventos`}
                    />

                    <EventFilters
                        searchTerm={searchTerm}
                        filtroOrganizador={filtroOrganizador}
                        organizadores={organizadores}
                        eventosCount={eventosFiltrados.length}
                        totalEventos={eventos.length}
                        onSearchChange={handleSearchChange}
                        onOrganizadorChange={handleOrganizadorFilterChange}
                        onClearFilters={limpiarFiltros}
                        hasActiveFilters={!!(searchTerm || filtroOrganizador)}
                    />

                    <EventsList
                        eventos={eventosFiltrados}
                        onVerDetalles={verDetallesEvento}
                        formatFecha={formatFecha}
                        formatHora={formatHora}
                        getLugarTexto={getLugarTexto}
                        getEstadoEvento={getEstadoEvento}
                        sidebarCollapsed={sidebarCollapsed}
                    />
                </main>

                <Footer />
            </div>

            {showModal && eventoSeleccionado && (
                <EventDetailsModal
                    evento={eventoSeleccionado}
                    onClose={cerrarModal}
                    formatFecha={formatFecha}
                    formatHora={formatHora}
                    getLugarTexto={getLugarTexto}
                    getEstadoEvento={getEstadoEvento}
                />
            )}
        </div>
    );
};

export default EventosContainer;
