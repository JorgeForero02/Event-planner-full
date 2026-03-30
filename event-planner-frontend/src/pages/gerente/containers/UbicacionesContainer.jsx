import React from 'react';
import { useLocations } from '../hooks/useLocations';
import GerenteSidebar from '../../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import Header from '../../../layouts/Header/header';
import Footer from '../../../layouts/FooterAsistente/footer';
import SearchBar from '../components/shared/SearchBar';
import LocationsList from '../components/lists/LocationsList';
import LocationForm from '../components/forms/LocationForm';
import EditLocationModal from '../components/modals/EditLocationModal';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';
import NotificationSystem from '../components/shared/NotificationSystem';
import LoadingState from '../components/shared/LoadingState';

const UbicacionesContainer = () => {
    const {
        filteredUbicaciones,
        empresa,
        ciudades,
        searchTerm,
        loading,
        sidebarCollapsed,
        showModal,
        showEditModal,
        showDeleteModal,
        editingUbicacion,
        deletingUbicacion,
        formData,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleToggle,
        openCreateModal,
        openEditModal,
        openDeleteModal,
        closeAllModals,
        handleInputChange,
        handleSearchChange,
        handleSidebarToggle,
        notifications,
        closeNotification
    } = useLocations();

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50 items-center justify-center">
                <LoadingState message="Cargando ubicaciones..." />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <GerenteSidebar onToggle={handleSidebarToggle} />
            <div className={`shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`} />

            <NotificationSystem
                notifications={Array.isArray(notifications) ? notifications : []}
                onClose={closeNotification}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header />

                <main className="flex-1 overflow-auto p-6 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Ubicaciones</h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Empresa: <span className="font-medium text-slate-700">{empresa?.nombre || 'Cargando...'}</span>
                            </p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            disabled={!empresa}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            + Crear Ubicacion
                        </button>
                    </div>

                    <SearchBar
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Buscar por nombre o direccion..."
                    />

                    <LocationsList
                        ubicaciones={filteredUbicaciones}
                        onEdit={openEditModal}
                        onToggle={handleToggle}
                    />
                </main>

                <Footer />
            </div>

            {showModal && (
                <LocationForm
                    title="Crear Nueva Ubicacion"
                    formData={formData}
                    ciudades={ciudades}
                    empresa={empresa}
                    onSubmit={handleCreate}
                    onClose={closeAllModals}
                    onInputChange={handleInputChange}
                />
            )}

            {showEditModal && editingUbicacion && (
                <EditLocationModal
                    ubicacion={editingUbicacion}
                    formData={formData}
                    ciudades={ciudades}
                    empresa={empresa}
                    onSubmit={handleUpdate}
                    onClose={closeAllModals}
                    onInputChange={handleInputChange}
                />
            )}

            {showDeleteModal && deletingUbicacion && (
                <DeleteConfirmationModal
                    item={deletingUbicacion}
                    itemType="ubicacion"
                    itemName={deletingUbicacion.lugar}
                    onConfirm={handleDelete}
                    onClose={closeAllModals}
                />
            )}
        </div>
    );
};

export default UbicacionesContainer;
