import React from 'react';
import { usePlaces } from '../hooks/usePlaces';
import GerenteSidebar from '../../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import Header from '../../../layouts/Header/header';
import Footer from '../../../layouts/FooterAsistente/footer';
import SearchBar from '../components/shared/SearchBar';
import PlacesList from '../components/lists/PlacesList';
import PlaceForm from '../components/forms/PlaceForm';
import EditPlaceModal from '../components/modals/EditPlaceModal';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';
import NotificationSystem from '../components/shared/NotificationSystem';
import LoadingState from '../components/shared/LoadingState';

const LugaresContainer = () => {
    const {
        filteredLugares,
        ubicaciones,
        searchTerm,
        empresaSeleccionada,
        loading,
        sidebarCollapsed,
        showModal,
        showEditModal,
        showDeleteModal,
        editingLugar,
        deletingLugar,
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
    } = usePlaces();

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50 items-center justify-center">
                <LoadingState message="Cargando lugares..." />
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
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Lugares</h1>
                            {empresaSeleccionada && (
                                <p className="text-sm text-slate-500 mt-0.5">
                                    Empresa: <span className="font-medium text-slate-700">{empresaSeleccionada.nombre}</span>
                                </p>
                            )}
                        </div>
                        <button
                            onClick={openCreateModal}
                            disabled={!empresaSeleccionada}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            + Crear Lugar
                        </button>
                    </div>

                    <SearchBar
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Buscar por nombre o descripcion..."
                    />

                    <PlacesList
                        lugares={filteredLugares}
                        onEdit={openEditModal}
                        onToggle={handleToggle}
                    />
                </main>

                <Footer />
            </div>

            {showModal && empresaSeleccionada && (
                <PlaceForm
                    formData={formData}
                    ubicaciones={ubicaciones}
                    empresa={empresaSeleccionada}
                    onSubmit={handleCreate}
                    onClose={closeAllModals}
                    onInputChange={handleInputChange}
                />
            )}

            {showEditModal && editingLugar && empresaSeleccionada && (
                <EditPlaceModal
                    lugar={editingLugar}
                    formData={formData}
                    ubicaciones={ubicaciones}
                    empresa={empresaSeleccionada}
                    onSubmit={handleUpdate}
                    onClose={closeAllModals}
                    onInputChange={handleInputChange}
                />
            )}

            {showDeleteModal && deletingLugar && (
                <DeleteConfirmationModal
                    item={deletingLugar}
                    itemType="lugar"
                    itemName={deletingLugar.nombre}
                    onConfirm={handleDelete}
                    onClose={closeAllModals}
                />
            )}
        </div>
    );
};

export default LugaresContainer;
