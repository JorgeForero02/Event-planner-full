import React, { useState, useEffect, useMemo } from 'react';
import { useEncuestasPonente } from '../../hooks/useEncuestasPonente';
import EncuestaCard from '../ui/EncuestaCard';
import CrearEncuestaModal from '../ui/CrearEncuestaModal';
import EditarEncuestaModal from '../ui/EditarEncuestaModal';
import EstadisticasModal from '../ui/EstadisticasModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';

const EncuestasSection = ({ eventos = [], ponenteId }) => {
    const [selectedEvento, setSelectedEvento] = useState('');
    const [selectedActividad, setSelectedActividad] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [showCrearModal, setShowCrearModal] = useState(false);
    const [showEditarModal, setShowEditarModal] = useState(false);
    const [showEstadisticasModal, setShowEstadisticasModal] = useState(false);
    const [encuestaSeleccionada, setEncuestaSeleccionada] = useState(null);
    const [alerta, setAlerta] = useState(null);

    const [showRapidaModal, setShowRapidaModal] = useState(false);
    const [rapidaForm, setRapidaForm] = useState({ titulo: '', url_google_form: '', id_actividad: '' });
    const [rapidaErrors, setRapidaErrors] = useState({});
    const [rapidaSaving, setRapidaSaving] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const {
        encuestas,
        loading,
        error,
        obtenerEncuestasPorEvento,
        obtenerEncuestasPorActividad,
        crearEncuesta,
        crearEncuestaRapida,
        actualizarEncuesta,
        eliminarEncuesta,
        enviarEncuestaMasiva,
        filtrarPorTipo,
        filtrarPorEstado,
        obtenerEstadisticasGenerales,
    } = useEncuestasPonente();

    const actividadesFiltradas = useMemo(() => {
        if (!selectedEvento) return [];

        const eventoSeleccionado = eventos.find(e => e.id === parseInt(selectedEvento));
        if (!eventoSeleccionado || !eventoSeleccionado.actividades) return [];

        return eventoSeleccionado.actividades.map(actividad => ({
            id_actividad: actividad.id_actividad,
            titulo: actividad.titulo,
            fecha_actividad: actividad.fecha_actividad,
            id_evento: eventoSeleccionado.id
        }));
    }, [selectedEvento, eventos]);

    const tiposEncuesta = [
        { value: 'todos', label: 'Todos los tipos' },
        { value: 'pre_actividad', label: 'Pre-Actividad' },
        { value: 'durante_actividad', label: 'Durante Actividad' },
        { value: 'post_actividad', label: 'Post-Actividad' }
    ];

    const estadosEncuesta = [
        { value: 'todos', label: 'Todos los estados' },
        { value: 'borrador', label: 'Borrador' },
        { value: 'activa', label: 'Activa' },
        { value: 'cerrada', label: 'Cerrada' }
    ];

    useEffect(() => {
    }, [ponenteId]);

    const cargarEncuestas = async () => {
        if (!selectedEvento && !selectedActividad) {
            return;
        }

        try {
            if (selectedActividad) {
                await obtenerEncuestasPorActividad(selectedActividad);
            } else if (selectedEvento) {
                await obtenerEncuestasPorEvento(selectedEvento);
            }
        } finally {
        }
    };

    useEffect(() => {
        cargarEncuestas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEvento, selectedActividad]);
    const encuestasFiltradas = useMemo(() => {
        let filtradas = encuestas;

        if (filtroTipo !== 'todos') {
            filtradas = filtrarPorTipo(filtroTipo);
        }

        if (filtroEstado !== 'todos') {
            filtradas = filtrarPorEstado(filtroEstado);
        }

        return filtradas;
    }, [encuestas, filtroTipo, filtroEstado, filtrarPorTipo, filtrarPorEstado]);

    const estadisticas = obtenerEstadisticasGenerales();

    const mostrarAlerta = (tipo, mensaje) => {
        setAlerta({ tipo, mensaje });
        setTimeout(() => setAlerta(null), 3000);
    };

    const handleResetFiltros = () => {
        setSelectedEvento('');
        setSelectedActividad('');
        setFiltroTipo('todos');
        setFiltroEstado('todos');
    };

    const handleEventoChange = (e) => {
        const nuevoEventoId = e.target.value;
        setSelectedEvento(nuevoEventoId);
        setSelectedActividad('');
    };

    const handleCrearEncuesta = () => {
        if (!selectedEvento && !selectedActividad) {
            mostrarAlerta('error', 'Por favor, selecciona un evento o actividad primero');
            return;
        }
        setShowCrearModal(true);
    };

    const handleCrearRapida = () => {
        if (!selectedActividad) {
            mostrarAlerta('error', 'Selecciona una actividad para crear una encuesta rápida');
            return;
        }
        setRapidaForm({ titulo: '', url_google_form: '', id_actividad: selectedActividad });
        setRapidaErrors({});
        setShowRapidaModal(true);
    };

    const handleConfirmarRapida = async () => {
        const errors = {};
        if (!rapidaForm.titulo.trim()) errors.titulo = 'El título es obligatorio';
        if (!rapidaForm.url_google_form.trim()) errors.url_google_form = 'La URL es obligatoria';
        if (Object.keys(errors).length) { setRapidaErrors(errors); return; }
        setRapidaSaving(true);
        try {
            const res = await crearEncuestaRapida({
                titulo: rapidaForm.titulo,
                url_google_form: rapidaForm.url_google_form,
                id_actividad: parseInt(rapidaForm.id_actividad),
                id_evento: parseInt(selectedEvento)
            });
            if (res.success) {
                mostrarAlerta('success', 'Encuesta rápida creada y activada');
                setShowRapidaModal(false);
                await cargarEncuestas();
            }
        } catch (err) {
            mostrarAlerta('error', err.message || 'Error al crear encuesta rápida');
        }
        setRapidaSaving(false);
    };

    const handleConfirmarCreacion = async (encuestaData) => {
        try {
            const datosAEnviar = {
                ...encuestaData,
                id_evento: parseInt(encuestaData.id_evento),
                id_actividad: encuestaData.id_actividad === 'evento' ? null : encuestaData.id_actividad
            };

            const response = await crearEncuesta(datosAEnviar);

            if (response.success) {
                mostrarAlerta('success', 'Encuesta creada exitosamente');
                return true;
            } else {
                mostrarAlerta('error', response.message || 'Error al crear encuesta');
                return false;
            }
        } catch (error) {
            mostrarAlerta('error', 'Error al crear encuesta');
            return false;
        }
    };

    const handleEditarEncuesta = (encuesta) => {
        setEncuestaSeleccionada(encuesta);
        setShowEditarModal(true);
    };

    const handleConfirmarEdicion = async (encuestaId, datos) => {
        try {
            const response = await actualizarEncuesta(encuestaId, datos);

            if (response.success) {
                mostrarAlerta('success', 'Encuesta actualizada exitosamente');
                return true;
            } else {
                mostrarAlerta('error', response.message || 'Error al actualizar encuesta');
                return false;
            }
        } catch (error) {
            mostrarAlerta('error', 'Error al actualizar encuesta');
            return false;
        }
    };

    const handleEliminarEncuesta = (encuestaId) => {
        setConfirmDeleteId(encuestaId);
    };

    const confirmarEliminar = async () => {
        try {
            const response = await eliminarEncuesta(confirmDeleteId);
            setConfirmDeleteId(null);
            if (response.success) {
                mostrarAlerta('success', 'Encuesta eliminada exitosamente');
            }
        } catch {
            mostrarAlerta('error', 'Error al eliminar encuesta');
            setConfirmDeleteId(null);
        }
    };

    const handleEnviarMasivo = async (encuestaId) => {
        try {
            const response = await enviarEncuestaMasiva(encuestaId);

            if (response.success) {
                mostrarAlerta('success', 'Encuesta enviada');

                setTimeout(() => {
                    cargarEncuestas();
                }, 1000);
            }
        } catch (error) {
            mostrarAlerta('error', error.message || 'Error al enviar encuesta');
        }
    };

    const handleVerEstadisticas = (encuesta) => {
        setEncuestaSeleccionada(encuesta);
        setShowEstadisticasModal(true);
    };

    const getEventoSeleccionado = () => {
        return eventos.find(e => e.id === parseInt(selectedEvento));
    };

    const getActividadSeleccionada = () => {
        return actividadesFiltradas.find(a => a.id_actividad === parseInt(selectedActividad));
    };

    const selectCls = "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50";
    const labelCls = "text-xs font-semibold text-slate-500";

    return (
        <div className="space-y-4">
            {alerta && (
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium ${
                    alerta.tipo === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    alerta.tipo === 'error'   ? 'bg-red-50 text-red-700 border border-red-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                    <span>{alerta.mensaje}</span>
                    <button onClick={() => setAlerta(null)} className="ml-4 text-lg leading-none opacity-70 hover:opacity-100">&times;</button>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h1 className="text-xl font-bold text-slate-800">Encuestas</h1>
                <p className="text-sm text-slate-500 mt-0.5">Selecciona un evento y una actividad para ver las encuestas disponibles.</p>
            </div>

            {/* Cascade filters */}
            <div className="bg-white rounded-xl border border-slate-200 px-6 py-4 flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1 min-w-[180px]">
                    <label className={labelCls}>Evento</label>
                    <select className={selectCls} value={selectedEvento} onChange={handleEventoChange}>
                        <option value="">Selecciona evento</option>
                        {eventos.map(evento => {
                            const fechaMostrar = evento.fecha_inicio || evento.fecha || evento.fecha_creacion;
                            return (
                                <option key={evento.id} value={evento.id}>
                                    {evento.titulo}{fechaMostrar ? ` - ${new Date(fechaMostrar).toLocaleDateString()}` : ''}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="flex flex-col gap-1 min-w-[180px]">
                    <label className={labelCls}>Actividad</label>
                    <select className={selectCls} value={selectedActividad}
                        onChange={(e) => setSelectedActividad(e.target.value)}
                        disabled={!selectedEvento}>
                        <option value="">Selecciona actividad</option>
                        {actividadesFiltradas.map(actividad => (
                            <option key={actividad.id_actividad} value={actividad.id_actividad}>
                                {actividad.titulo} - {new Date(actividad.fecha_actividad).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                    {selectedEvento && actividadesFiltradas.length === 0 && (
                        <p className="text-xs text-slate-400 mt-0.5">Sin actividades. Puedes crear encuestas para el evento completo.</p>
                    )}
                </div>

                <div className="flex flex-col gap-1 min-w-[160px]">
                    <label className={labelCls}>Tipo de encuesta</label>
                    <select className={selectCls} value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        disabled={!selectedEvento && !selectedActividad}>
                        {tiposEncuesta.map(tipo => <option key={tipo.value} value={tipo.value}>{tipo.label}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-1 min-w-[140px]">
                    <label className={labelCls}>Estado</label>
                    <select className={selectCls} value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        disabled={!selectedEvento && !selectedActividad}>
                        {estadosEncuesta.map(estado => <option key={estado.value} value={estado.value}>{estado.label}</option>)}
                    </select>
                </div>

                <button onClick={handleResetFiltros}
                    className="h-9 px-4 rounded-lg text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                    Limpiar Filtros
                </button>
            </div>

            {selectedEvento && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 px-5 py-3 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-700 mr-2">
                        Encuestas {selectedActividad ? `de ${getActividadSeleccionada()?.titulo}` : 'del Evento'}:
                        {' '}{getEventoSeleccionado()?.titulo}
                    </h3>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {getEventoSeleccionado()?.titulo}
                    </span>
                    {selectedActividad && selectedActividad !== 'evento' && getActividadSeleccionada() && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            {getActividadSeleccionada()?.titulo}
                        </span>
                    )}
                </div>
            )}

            {!selectedEvento && !selectedActividad ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-1">
                    <h3 className="text-base font-semibold text-slate-700">Selecciona un evento</h3>
                    <p className="text-sm text-slate-500">Por favor, selecciona un evento para ver y gestionar las encuestas.</p>
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">Cargando encuestas...</p>
                </div>
            ) : error ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
                    <h3 className="text-base font-semibold text-danger">Error al cargar encuestas</h3>
                    <p className="text-sm text-slate-500">{error}</p>
                    <button onClick={cargarEncuestas}
                        className="h-9 px-5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors">
                        Reintentar
                    </button>
                </div>
            ) : encuestasFiltradas.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
                    <h3 className="text-base font-semibold text-slate-700">No hay encuestas</h3>
                    <p className="text-sm text-slate-500">No se encontraron encuestas para la selección actual.</p>
                    <button onClick={handleCrearEncuesta}
                        className="h-9 px-5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors">
                        Crear primera encuesta
                    </button>
                </div>
            ) : (
                <>
                    {/* Stats + actions row */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center min-w-[70px]">
                            <p className="text-xl font-bold text-slate-800">{estadisticas.total}</p>
                            <p className="text-xs text-slate-500">Total</p>
                        </div>
                        {estadisticas.borrador > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center min-w-[70px]">
                                <p className="text-xl font-bold text-slate-500">{estadisticas.borrador}</p>
                                <p className="text-xs text-slate-500">Borradores</p>
                            </div>
                        )}
                        {estadisticas.activa > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center min-w-[70px]">
                                <p className="text-xl font-bold text-success">{estadisticas.activa}</p>
                                <p className="text-xs text-slate-500">Activas</p>
                            </div>
                        )}
                        {estadisticas.cerrada > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center min-w-[70px]">
                                <p className="text-xl font-bold text-danger">{estadisticas.cerrada}</p>
                                <p className="text-xs text-slate-500">Cerradas</p>
                            </div>
                        )}
                        <button onClick={handleCrearEncuesta}
                            className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center min-w-[90px] hover:border-brand-600 hover:text-brand-600 transition-colors cursor-pointer">
                            <p className="text-xl font-bold">+</p>
                            <p className="text-xs text-slate-500">Crear Encuesta</p>
                        </button>
                        <button onClick={handleCrearRapida}
                            className="bg-white rounded-xl border border-emerald-300 px-4 py-3 text-center min-w-[90px] hover:border-success hover:text-success transition-colors cursor-pointer"
                            title="Crea y activa una encuesta instantáneamente">
                            <p className="text-xl font-bold text-success">⚡</p>
                            <p className="text-xs text-slate-500">Encuesta Rápida</p>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {encuestasFiltradas.map(encuesta => (
                            <EncuestaCard
                                key={encuesta.id}
                                encuesta={encuesta}
                                onEdit={handleEditarEncuesta}
                                onDelete={handleEliminarEncuesta}
                                onEnviar={handleEnviarMasivo}
                                onVerEstadisticas={handleVerEstadisticas}
                            />
                        ))}
                    </div>
                </>
            )}

            {showCrearModal && (
                <CrearEncuestaModal
                    onClose={() => setShowCrearModal(false)}
                    onConfirm={handleConfirmarCreacion}
                    eventos={eventos}
                />
            )}

            {showEditarModal && encuestaSeleccionada && (
                <EditarEncuestaModal
                    encuesta={encuestaSeleccionada}
                    onClose={() => setShowEditarModal(false)}
                    onConfirm={handleConfirmarEdicion}
                    eventos={eventos}
                    actividades={actividadesFiltradas}
                />
            )}

            {showEstadisticasModal && encuestaSeleccionada && (
                <EstadisticasModal
                    encuestaId={encuestaSeleccionada.id}
                    onClose={() => setShowEstadisticasModal(false)}
                />
            )}

            <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-600">¿Estás seguro de que deseas eliminar esta encuesta? Esta acción no se puede deshacer.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmarEliminar}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showRapidaModal} onOpenChange={(o) => !rapidaSaving && setShowRapidaModal(o)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Encuesta Rápida</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-500">La encuesta se creará y activará instantáneamente para la actividad seleccionada.</p>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="rapida-titulo">Título *</Label>
                            <Input
                                id="rapida-titulo"
                                value={rapidaForm.titulo}
                                onChange={(e) => setRapidaForm(f => ({ ...f, titulo: e.target.value }))}
                                placeholder="Ej: Feedback de la sesión"
                            />
                            {rapidaErrors.titulo && <p className="text-sm text-danger">{rapidaErrors.titulo}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="rapida-url">URL de Google Forms *</Label>
                            <Input
                                id="rapida-url"
                                value={rapidaForm.url_google_form}
                                onChange={(e) => setRapidaForm(f => ({ ...f, url_google_form: e.target.value }))}
                                placeholder="https://docs.google.com/forms/..."
                            />
                            {rapidaErrors.url_google_form && <p className="text-sm text-danger">{rapidaErrors.url_google_form}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRapidaModal(false)} disabled={rapidaSaving}>Cancelar</Button>
                        <Button onClick={handleConfirmarRapida} disabled={rapidaSaving}>
                            {rapidaSaving ? 'Creando...' : 'Crear y Activar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EncuestasSection;