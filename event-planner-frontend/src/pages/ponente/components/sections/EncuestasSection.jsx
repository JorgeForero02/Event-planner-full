import React, { useState, useEffect, useMemo } from 'react';
import styles from '../styles/EncuestasSection.module.css';
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
    // eslint-disable-next-line no-unused-vars
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [showRapidaModal, setShowRapidaModal] = useState(false);
    const [rapidaForm, setRapidaForm] = useState({ titulo: '', url_google_form: '', id_actividad: '' });
    const [rapidaErrors, setRapidaErrors] = useState({});
    const [rapidaSaving, setRapidaSaving] = useState(false);

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
        if (!ponenteId) {
            console.error('No se recibió ponenteId');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ponenteId]);

    const cargarEncuestas = async () => {
        if (!selectedEvento && !selectedActividad) {
            return;
        }

        setIsRefreshing(true);
        try {
            if (selectedActividad) {
                await obtenerEncuestasPorActividad(selectedActividad);
            } else if (selectedEvento) {
                await obtenerEncuestasPorEvento(selectedEvento);
            }
        } finally {
            setIsRefreshing(false);
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

    const handleEliminarEncuesta = async (encuestaId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta encuesta? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const response = await eliminarEncuesta(encuestaId);

            if (response.success) {
                mostrarAlerta('success', 'Encuesta eliminada exitosamente');
            }
        } catch (error) {
            mostrarAlerta('error', 'Error al eliminar encuesta');
        }
    };

    const handleEnviarMasivo = async (encuestaId) => {
        try {
            const response = await enviarEncuestaMasiva(encuestaId);

            if (response.success) {
                // eslint-disable-next-line no-unused-vars
                const totalEnviadas = response.data?.data?.total_enviadas || 0;
                const asistentes = response.data?.data?.asistentes || [];

                let mensaje = `Encuesta enviada`;

                if (asistentes.length > 0) {
                    // eslint-disable-next-line no-unused-vars
                    const nombres = asistentes.map(a => a.nombre).join(', ');
                    mensaje = `Encuesta enviada`;
                }

                mostrarAlerta('success', mensaje);

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

    return (
        <div className={styles.encuestasContainer}>
            {alerta && (
                <div className={`${styles.alerta} ${styles[alerta.tipo]}`}>
                    <div className={styles.alertaContenido}>
                        <span>{alerta.mensaje}</span>
                        <button
                            className={styles.cerrarAlerta}
                            onClick={() => setAlerta(null)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Encuestas</h1>
                    <p className={styles.subtitle}>
                        Selecciona un evento y una actividad para ver las encuestas disponibles.
                    </p>
                </div>
            </div>

            <div className={styles.filtrosCascada}>
                <div className={styles.filtroGrupo}>
                    <label className={styles.filtroLabel}>Evento</label>
                    <select
                        className={styles.filtroSelect}
                        value={selectedEvento}
                        onChange={handleEventoChange}
                    >
                        <option value="">Selecciona evento</option>
                        {eventos.map(evento => {
                            const fechaMostrar = evento.fecha_inicio || evento.fecha || evento.fecha_creacion;

                            return (
                                <option key={evento.id} value={evento.id}>
                                    {evento.titulo} {fechaMostrar ? `- ${new Date(fechaMostrar).toLocaleDateString()}` : ''}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className={styles.filtroGrupo}>
                    <label className={styles.filtroLabel}>Actividad</label>
                    <select
                        className={styles.filtroSelect}
                        value={selectedActividad}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSelectedActividad(value);
                        }}
                        disabled={!selectedEvento}
                    >
                        <option value="">Selecciona actividad</option>
                        {actividadesFiltradas.map(actividad => (
                            <option key={actividad.id_actividad} value={actividad.id_actividad}>
                                {actividad.titulo} - {new Date(actividad.fecha_actividad).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                    {selectedEvento && actividadesFiltradas.length === 0 && (
                        <p className={styles.sinActividades}>
                            Este evento no tiene actividades. Puedes crear encuestas para el evento completo.
                        </p>
                    )}
                </div>

                <div className={styles.filtroGrupo}>
                    <label className={styles.filtroLabel}>Tipo de encuesta</label>
                    <select
                        className={styles.filtroSelect}
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        disabled={!selectedEvento && !selectedActividad}
                    >
                        {tiposEncuesta.map(tipo => (
                            <option key={tipo.value} value={tipo.value}>
                                {tipo.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.filtroGrupo}>
                    <label className={styles.filtroLabel}>Estado</label>
                    <select
                        className={styles.filtroSelect}
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        disabled={!selectedEvento && !selectedActividad}
                    >
                        {estadosEncuesta.map(estado => (
                            <option key={estado.value} value={estado.value}>
                                {estado.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    className={styles.resetButton}
                    onClick={handleResetFiltros}
                >
                    Limpiar Filtros
                </button>
            </div>

            {selectedEvento && (
                <div className={styles.actividadSeleccionada}>
                    <h3>
                        Encuestas {selectedActividad === 'evento' ? 'del Evento' :
                            selectedActividad ? `de ${getActividadSeleccionada()?.titulo}` :
                                'del Evento'}: {getEventoSeleccionado()?.titulo}
                    </h3>
                    <div className={styles.badges}>
                        <span className={styles.eventoBadge}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="4" width="18" height="18" rx="2"
                                    stroke="currentColor" strokeWidth="2" />
                                <line x1="3" y1="10" x2="21" y2="10"
                                    stroke="currentColor" strokeWidth="2" />
                            </svg>
                            {getEventoSeleccionado()?.titulo}
                        </span>
                        {selectedActividad && selectedActividad !== 'evento' && getActividadSeleccionada() && (
                            <span className={styles.actividadBadge}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="9"
                                        stroke="currentColor" strokeWidth="2" />
                                    <line x1="12" y1="8" x2="12" y2="16"
                                        stroke="currentColor" strokeWidth="2" />
                                    <line x1="8" y1="12" x2="16" y2="12"
                                        stroke="currentColor" strokeWidth="2" />
                                </svg>
                                {getActividadSeleccionada()?.titulo}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {!selectedEvento && !selectedActividad ? (
                <div className={styles.noSeleccion}>
                    <h3>Selecciona un evento</h3>
                    <p>Por favor, selecciona un evento para ver y gestionar las encuestas.</p>
                </div>
            ) : loading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando encuestas...</p>
                </div>
            ) : error ? (
                <div className={styles.errorContainer}>
                    <h3>Error al cargar encuestas</h3>
                    <p>{error}</p>
                    <button
                        className={styles.retryButton}
                        onClick={cargarEncuestas}
                    >
                        Reintentar
                    </button>
                </div>
            ) : encuestasFiltradas.length === 0 ? (
                <div className={styles.noEncuestas}>
                    <h3>No hay encuestas</h3>
                    <p>No se encontraron encuestas para la selección actual.</p>
                    <button
                        className={styles.retryButton}
                        onClick={handleCrearEncuesta}
                    >
                        Crear primera encuesta
                    </button>
                </div>
            ) : (
                <>
                    <div className={styles.stats}>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>{estadisticas.total}</span>
                            <span className={styles.statLabel}>Total</span>
                        </div>

                        {estadisticas.borrador > 0 && (
                            <div className={styles.statCard}>
                                <span className={styles.statNumber} style={{ color: '#6b7280' }}>
                                    {estadisticas.borrador}
                                </span>
                                <span className={styles.statLabel}>Borradores</span>
                            </div>
                        )}

                        {estadisticas.activa > 0 && (
                            <div className={styles.statCard}>
                                <span className={styles.statNumber} style={{ color: '#059669' }}>
                                    {estadisticas.activa}
                                </span>
                                <span className={styles.statLabel}>Activas</span>
                            </div>
                        )}

                        {estadisticas.cerrada > 0 && (
                            <div className={styles.statCard}>
                                <span className={styles.statNumber} style={{ color: '#dc2626' }}>
                                    {estadisticas.cerrada}
                                </span>
                                <span className={styles.statLabel}>Cerradas</span>
                            </div>
                        )}

                        <button
                            className={`${styles.statCard} ${styles.btnCrear}`}
                            onClick={handleCrearEncuesta}
                        >
                            <span className={styles.statNumber}>+</span>
                            <span className={styles.statLabel}>Crear Encuesta</span>
                        </button>
                        <button
                            className={`${styles.statCard} ${styles.btnCrear}`}
                            onClick={handleCrearRapida}
                            title="Crea y activa una encuesta instantáneamente para tu actividad"
                            style={{ borderColor: '#059669', color: '#059669' }}
                        >
                            <span className={styles.statNumber}>⚡</span>
                            <span className={styles.statLabel}>Encuesta Rápida</span>
                        </button>
                    </div>

                    <div className={styles.encuestasGrid}>
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