import React, { useState, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { AlertCircle, BarChart2 } from 'lucide-react';
import { API_URL } from '../../../config/apiConfig';

const OcupacionSection = ({ empresaId }) => {
    const [ocupacion, setOcupacion] = useState([]);
    const [ocupacionLoading, setOcupacionLoading] = useState(false);
    const [ocupacionError, setOcupacionError] = useState('');

    useEffect(() => {
        if (!empresaId) return;
        const fetchOcupacion = async () => {
            setOcupacionLoading(true);
            setOcupacionError('');
            try {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`${API_URL}/empresas/${empresaId}/estadisticas-ocupacion`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setOcupacion(Array.isArray(data.data) ? data.data : []);
                } else {
                    setOcupacionError(data.message || 'No se pudo cargar el resumen de ocupación.');
                }
            } catch {
                setOcupacionError('Error de conexión al cargar ocupación.');
            } finally {
                setOcupacionLoading(false);
            }
        };
        fetchOcupacion();
    }, [empresaId]);

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
                <BarChart2 size={16} className="text-brand-600" />
                <h2 className="text-sm font-semibold text-slate-700">Resumen de Ocupación por Sala</h2>
            </div>
            {ocupacionLoading && (
                <p className="text-sm text-slate-500 px-5 py-4">Cargando datos de ocupación...</p>
            )}
            {ocupacionError && (
                <p className="text-sm text-red-600 px-5 py-4">{ocupacionError}</p>
            )}
            {!ocupacionLoading && !ocupacionError && ocupacion.length === 0 && (
                <p className="text-sm text-slate-400 px-5 py-4">Sin datos de ocupación disponibles.</p>
            )}
            {!ocupacionLoading && ocupacion.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Sala</th>
                                <th className="px-5 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Eventos realizados</th>
                                <th className="px-5 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Ocupación promedio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ocupacion.map((sala, idx) => (
                                <tr key={sala.id ?? idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                    <td className="px-5 py-3 font-medium text-slate-800">{sala.nombre || sala.name || '—'}</td>
                                    <td className="px-5 py-3 text-center text-slate-600">{sala.eventos_realizados ?? '—'}</td>
                                    <td className="px-5 py-3 text-center">
                                        {sala.ocupacion_promedio != null ? (
                                            <span className={`font-semibold ${
                                                sala.ocupacion_promedio >= 75 ? 'text-green-600'
                                                : sala.ocupacion_promedio >= 40 ? 'text-amber-600'
                                                : 'text-slate-500'
                                            }`}>
                                                {Number(sala.ocupacion_promedio).toFixed(1)}%
                                            </span>
                                        ) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

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
        showBloqueoModal,
        eventosBloqueantes,
        ubicacionBloqueo,
        closeBloqueoModal,
        openCreateModal,
        openEditModal,
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

                    {empresa?.id && (
                        <OcupacionSection empresaId={empresa.id} />
                    )}
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

            <Dialog open={showBloqueoModal} onOpenChange={(open) => !open && closeBloqueoModal()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-700">
                            <AlertCircle size={20} />
                            No se puede deshabilitar: "{ubicacionBloqueo?.lugar}"
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-sm text-slate-600">
                            Esta ubicación tiene salas con actividades programadas. Debes reasignar o cancelar esas actividades primero.
                        </p>
                        <ul className="space-y-2">
                            {eventosBloqueantes.map((ev, idx) => (
                                <li key={ev.id ?? idx} className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm">
                                    <span className="font-semibold text-slate-800">{ev.titulo || ev.nombre}</span>
                                    {ev.fecha_inicio && (
                                        <span className="text-slate-500">&mdash; {new Date(ev.fecha_inicio).toLocaleDateString('es-CO')}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <DialogFooter>
                        <Button onClick={closeBloqueoModal}>Entendido</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UbicacionesContainer;
