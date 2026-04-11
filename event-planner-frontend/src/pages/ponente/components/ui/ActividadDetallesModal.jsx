import { useEffect, useState } from 'react';
import styles from '../styles/EventModal.module.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';

const ActividadDetallesModal = ({ actividadId, eventoId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detalle, setDetalle] = useState(null);
    const [eventoData, setEventoData] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        const fetchDetalle = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('access_token');

                let eventoIdFinal = eventoId;

                if (!eventoIdFinal) {
                    const actividadDirectaRes = await fetch(`${API_URL}/actividades/${actividadId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (actividadDirectaRes.ok) {
                        const actividadDirectaJson = await actividadDirectaRes.json();
                        if (actividadDirectaJson.success) {
                            eventoIdFinal = actividadDirectaJson.data?.id_evento;
                        }
                    }
                }

                if (!eventoIdFinal) {
                    throw new Error('No se pudo identificar el evento de la actividad');
                }

                const eventoRes = await fetch(`${API_URL}/eventos/${eventoIdFinal}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!eventoRes.ok) {
                    throw new Error(`Error ${eventoRes.status} al obtener datos del evento`);
                }

                const eventoJson = await eventoRes.json();

                if (!eventoJson.success || !eventoJson.data) {
                    throw new Error('No se pudo obtener la información del evento');
                }

                setEventoData(eventoJson.data);

                const actividadesRes = await fetch(`${API_URL}/eventos/${eventoIdFinal}/actividades`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!actividadesRes.ok) {
                    throw new Error(`Error ${actividadesRes.status} al obtener actividades`);
                }

                const actividadesJson = await actividadesRes.json();

                if (actividadesJson.success && actividadesJson.data) {
                    const actividadEncontrada = actividadesJson.data.find(actividad =>
                        actividad.id_actividad === parseInt(actividadId)
                    );

                    if (actividadEncontrada) {
                        setDetalle(actividadEncontrada);
                    } else {
                        throw new Error(`No se encontró la actividad con ID: ${actividadId}`);
                    }
                } else {
                    throw new Error('No se pudo obtener la información de las actividades');
                }
            } catch (err) {
                setError(err.message || 'Error cargando detalle');
            } finally {
                setLoading(false);
            }
        };

        if (actividadId) {
            fetchDetalle();
        } else {
            setError('No se proporcionó ID de actividad');
            setLoading(false);
        }
    }, [actividadId, eventoId, API_URL]);

    const formatFecha = (fechaString) => {
        if (!fechaString) return 'No definida';
        try {
            const fecha = new Date(fechaString);
            return fecha.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return 'Fecha inválida';
        }
    };

    const formatHora = (horaString) => {
        if (!horaString) return '';
        return horaString.substring(0, 5);
    };

    const calcularDuracion = (horaInicio, horaFin) => {
        if (!horaInicio || !horaFin) return 'No disponible';

        try {
            const inicio = new Date(`2000-01-01T${horaInicio}`);
            const fin = new Date(`2000-01-01T${horaFin}`);
            const diffMs = fin - inicio;
            const diffMins = Math.floor(diffMs / 60000);
            const hours = Math.floor(diffMins / 60);
            const minutes = diffMins % 60;

            if (hours > 0) {
                return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
            }
            return `${minutes} minutos`;
        } catch (e) {
            return 'No disponible';
        }
    };

    const handleRetry = () => {
        setLoading(true);
        setError(null);
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalles de la Actividad</DialogTitle>
                </DialogHeader>

                <div className={styles.modalBody}>
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <p>Cargando detalles de la actividad...</p>
                            <div className={styles.loadingSpinner}></div>
                        </div>
                    )}

                    {error && (
                        <div className={styles.errorContainer}>
                            <h3>Error</h3>
                            <p>{error}</p>
                            <div className={styles.errorActions}>
                                <button onClick={handleRetry} className={styles.retryButton}>
                                    Reintentar
                                </button>
                                <button onClick={onClose} className={styles.closeErrorButton}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}

                    {detalle && eventoData && !loading && !error && (
                        <div className={styles.eventInfoGrid}>

                            <div className={styles.infoSection}>
                                <h4>Información del Evento</h4>
                                <div className={styles.infoItem}>
                                    <label>Empresa</label>
                                    <span className={styles.empresaBadge}>
                                        {eventoData.empresa?.nombre || 'No especificada'}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Creador del Evento</label>
                                    <div className={styles.creadorInfo}>
                                        <div className={styles.creadorNombre}>
                                            {eventoData.creador?.nombre || 'No especificado'}
                                        </div>
                                        <div className={styles.creadorCorreo}>
                                            {eventoData.creador?.correo || 'Sin correo'}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Nombre del Evento</label>
                                    <p className={styles.eventoTitulo}>
                                        {eventoData.titulo || 'Sin título'}
                                    </p>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Descripción del Evento</label>
                                    <p className={styles.eventoDescripcion}>
                                        {eventoData.descripcion || 'No hay descripción disponible'}
                                    </p>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Cupos del Evento</label>
                                    <span className={styles.cuposBadge}>
                                        {eventoData.cupos || 0} cupos disponibles
                                    </span>
                                </div>
                            </div>

                            <div className={styles.infoSection}>
                                <h4>Fechas y Horarios</h4>
                                <div className={styles.infoItem}>
                                    <label>Fecha de la Actividad</label>
                                    <span className={styles.fechaTexto}>
                                        {formatFecha(detalle.fecha_actividad)}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Horario</label>
                                    <span className={styles.horarioTexto}>
                                        {detalle.hora_inicio && detalle.hora_fin
                                            ? `${formatHora(detalle.hora_inicio)} - ${formatHora(detalle.hora_fin)}`
                                            : 'No definido'
                                        }
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Duración</label>
                                    <span className={styles.duracionBadge}>
                                        {calcularDuracion(detalle.hora_inicio, detalle.hora_fin)}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.infoSection}>
                                <h4>Información Adicional</h4>
                                <div className={styles.infoItem}>
                                    <label>URL de Recursos</label>
                                    <span>
                                        {detalle.url ? (
                                            <a
                                                href={detalle.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.urlLink}
                                            >
                                                {detalle.url}
                                            </a>
                                        ) : (
                                            <span className={styles.sinUrl}>
                                                No hay URL disponible
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ActividadDetallesModal;