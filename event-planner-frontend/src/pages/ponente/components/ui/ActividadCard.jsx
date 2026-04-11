import { useState, useEffect } from 'react';
import { Calendar, Clock, Building2, ClipboardList } from 'lucide-react';
import StatusBadge from '../../../../components/ui/StatusBadge';
import SolicitudCambioModal from './SolicitarCambioModal';
import ResponderInvitacionModal from './ResponderInvitacionModal';
import ActividadDetallesModal from './ActividadDetallesModal';
import ponenteAgendaService from '../../../../services/ponenteAgendaService';
import { cn } from '../../../../lib/utils';

const ActividadCard = ({ actividad, showActions = true, onSolicitudEnviada, onActualizarEstado, onShowNotification }) => {
    const [showModal, setShowModal] = useState(false);
    const [showResponderModal, setShowResponderModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [estadoLocal, setEstadoLocal] = useState(actividad.estado);

    useEffect(() => {
        setEstadoLocal(actividad.estado);
    }, [actividad.estado]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Por definir';
        const date = new Date(dateString);
        const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return adjustedDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return adjustedDate.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        });
    };

    const getSafeValue = (obj, posiblesClaves, defaultValue = 'No disponible') => {
        if (!obj) return defaultValue;
        if (typeof obj !== 'object') return obj;
        for (let clave of posiblesClaves) {
            if (obj[clave] !== undefined && obj[clave] !== null && obj[clave] !== '') {
                return obj[clave];
            }
        }
        return defaultValue;
    };

    const showNotification = (message, type = 'info') => {
        if (onShowNotification) {
            onShowNotification(message, type);
        }
    };

    const handleSolicitarCambio = () => {
        if (estadoLocal !== 'aceptado') {
            showNotification(`Solo puedes solicitar cambios en actividades aceptadas. Estado actual: ${estadoLocal}`, 'warning');
            return;
        }
        setShowModal(true);
    };

    const handleResponderInvitacion = () => {
        if (estadoLocal !== 'pendiente') {
            showNotification(`Esta actividad ya está ${estadoLocal}. No puedes responder la invitación.`, 'warning');
            return;
        }
        setShowResponderModal(true);
    };

    const handleVerDetalles = () => {
        setShowDetails(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleCloseResponderModal = () => {
        setShowResponderModal(false);
    };

    const getTextoBotonPrincipal = () => {
        const estadoActual = estadoLocal || actividad.estado;

        if (estadoActual === 'pendiente') {
            return 'Responder';
        } else if (estadoActual === 'aceptado') {
            return 'Solicitar Cambio';
        } else if (estadoActual === 'rechazado') {
            return 'Actividad Rechazada';
        } else if (estadoActual === 'solicitud_cambio') {
            return 'Solicitud Enviada';
        }
        return 'Actividad';
    };

    const handleBotonPrincipal = () => {
        const estadoActual = estadoLocal || actividad.estado;

        if (estadoActual === 'pendiente') {
            handleResponderInvitacion();
        } else if (estadoActual === 'aceptado') {
            handleSolicitarCambio();
        }
    };

    const handleSolicitudSubmit = async (solicitudData) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('access_token');

            const nuevoEstado = 'solicitud_cambio';
            setEstadoLocal(nuevoEstado);

            if (onActualizarEstado) {
                onActualizarEstado(actividad.id_actividad, nuevoEstado, actividad.fecha_respuesta);
            }

            await ponenteAgendaService.solicitarCambios(
                actividad.id_ponente,
                actividad.id_actividad,
                solicitudData.cambios_solicitados,
                solicitudData.justificacion,
                token
            );

            showNotification('Tu solicitud de cambio ha sido enviada para revisión', 'success');
            setShowModal(false);

        } catch (error) {
            setEstadoLocal(actividad.estado);
            if (onActualizarEstado) {
                onActualizarEstado(actividad.id_actividad, actividad.estado, actividad.fecha_respuesta);
            }
            const mensaje = (error && error.message) ? error.message.toLowerCase() : '';

            if (mensaje.includes('pendiente') || mensaje.includes('ya tienes una solicitud')) {
                showNotification('Ya tienes una solicitud pendiente para esta actividad. Espera la respuesta antes de enviar una nueva.', 'warning');
            } else if (mensaje.includes('400') || mensaje.includes('bad request')) {
                showNotification('Error en los datos enviados. Verifica que todos los campos estén correctos.', 'error');
            } else {
                showNotification('Error al enviar la solicitud. Por favor intenta de nuevo.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRespuestaSubmit = async (respuestaData) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('access_token');
            const nuevoEstado = respuestaData.aceptar ? 'aceptado' : 'rechazado';
            const fechaRespuesta = new Date().toISOString();

            const resultado = await ponenteAgendaService.responderInvitacion(
                actividad.id_ponente,
                actividad.id_actividad,
                respuestaData.aceptar,
                respuestaData.motivo_rechazo || '',
                token
            );

            if (resultado.success || resultado.exito) {
                setEstadoLocal(nuevoEstado);

                if (onActualizarEstado) {
                    onActualizarEstado(
                        actividad.id_actividad,
                        nuevoEstado,
                        resultado.fecha_respuesta || fechaRespuesta
                    );
                }

                if (window.recargarActividades) {
                    window.recargarActividades();
                }

                localStorage.setItem(`actividad_${actividad.id_actividad}_respondida`, 'true');
                localStorage.setItem(`actividad_${actividad.id_actividad}_estado`, nuevoEstado);

                const mensajeExito = respuestaData.aceptar
                    ? '¡Invitación aceptada correctamente!'
                    : 'Invitación rechazada correctamente';

                showNotification(mensajeExito, 'success');
                setShowResponderModal(false);

                setTimeout(() => {
                    window.location.reload();
                }, 2000);

            } else {
                throw new Error(resultado.message || 'Error en la respuesta del servidor');
            }

        } catch (error) {
            if ((error.message && error.message.includes('ya fue respondida')) ||
                error.message.includes('Estado actual:')) {

                let estadoReal = estadoLocal;

                if (error.message.includes('rechazada') || error.message.includes('rechazado')) {
                    estadoReal = 'rechazado';
                }

                setEstadoLocal(estadoReal);

                if (onActualizarEstado) {
                    onActualizarEstado(
                        actividad.id_actividad,
                        estadoReal,
                        actividad.fecha_respuesta || new Date().toISOString()
                    );
                }

                localStorage.setItem(`actividad_${actividad.id_actividad}_estado`, estadoReal);

                showNotification(`Esta actividad ya fue ${estadoReal} anteriormente.`, 'info');

            } else {
                showNotification(`Error: ${error.message}`, 'error');
            }

            setShowResponderModal(false);
        } finally {
            setIsLoading(false);
        }
    };

    const nombreActividad = getSafeValue(actividad, ['nombre', 'titulo', 'actividad?.titulo'], 'Actividad sin nombre') ||
        getSafeValue(actividad.actividad, ['titulo', 'nombre'], 'Actividad sin nombre');
    const descripcion = getSafeValue(actividad, ['descripcion']) || getSafeValue(actividad.actividad, ['descripcion']);
    const fecha = getSafeValue(actividad, ['fecha', 'fecha_actividad']) || getSafeValue(actividad.actividad, ['fecha_actividad', 'fecha']);
    const horaInicio = getSafeValue(actividad, ['hora_inicio']) || getSafeValue(actividad.actividad, ['hora_inicio']);
    const horaFin = getSafeValue(actividad, ['hora_fin']) || getSafeValue(actividad.actividad, ['hora_fin']);
    const empresa = actividad?.actividad?.evento?.empresa || actividad?.evento?.empresa || actividad?.actividad?.empresa || '';

    const actividadId = actividad.id_ponente || actividad.id_actividad || actividad.actividad?.id_actividad || actividad.actividad?.id;

    const primaryBtnClass = cn(
        'flex-1 h-9 rounded-lg text-xs font-semibold transition-colors',
        estadoLocal === 'pendiente'
            ? 'bg-brand-600 text-white hover:bg-brand-700'
            : estadoLocal === 'aceptado'
                ? 'bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
    );

    return (
        <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">

                {/* Header */}
                <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 leading-snug truncate">{nombreActividad}</h3>
                        <span className="text-xs text-slate-500 mt-0.5 block">
                            {actividad.tipo || 'Actividad'}
                        </span>
                    </div>
                    <StatusBadge status={estadoLocal} className="shrink-0" />
                </div>

                {/* Details */}
                <div className="px-5 pb-3 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar size={12} className="shrink-0" />
                        {formatDate(fecha)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={12} className="shrink-0" />
                        {horaInicio && horaFin
                            ? `${horaInicio.substring(0, 5)} - ${horaFin.substring(0, 5)}`
                            : 'Por definir'}
                    </span>
                    {empresa && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Building2 size={12} className="shrink-0" />
                            {empresa}
                        </span>
                    )}
                </div>

                {/* Dates assigned/responded */}
                <div className="px-5 pb-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-2">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                        <ClipboardList size={12} className="shrink-0" />
                        Asignado: {formatDateTime(actividad.fecha_asignacion)}
                    </span>
                    {actividad.fecha_respuesta && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            Respuesta: {formatDateTime(actividad.fecha_respuesta)}
                        </span>
                    )}
                </div>

                {/* Description */}
                {descripcion && descripcion !== 'No disponible' && (
                    <div className="px-5 pb-3">
                        <p className="text-xs text-slate-500 line-clamp-2">{descripcion}</p>
                    </div>
                )}

                {/* Actions */}
                {showActions && (
                    <div className="mt-auto px-5 pb-5 flex gap-2">
                        <button
                            className={primaryBtnClass}
                            onClick={handleBotonPrincipal}
                            disabled={estadoLocal === 'rechazado' || estadoLocal === 'solicitud_cambio' || isLoading}
                        >
                            {isLoading ? 'Procesando...' : getTextoBotonPrincipal()}
                        </button>
                        <button
                            className="flex-1 h-9 rounded-lg bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors border border-slate-200"
                            onClick={handleVerDetalles}
                            disabled={isLoading}
                        >
                            Ver Detalles
                        </button>
                    </div>
                )}
            </div>

            {showResponderModal && estadoLocal === 'pendiente' && (
                <ResponderInvitacionModal
                    actividad={actividad}
                    onClose={handleCloseResponderModal}
                    onSubmit={handleRespuestaSubmit}
                />
            )}

            {showModal && estadoLocal === 'aceptado' && (
                <SolicitudCambioModal
                    actividad={actividad}
                    onClose={handleCloseModal}
                    onSubmit={handleSolicitudSubmit}
                />
            )}

            {showDetails && actividadId && (
                <ActividadDetallesModal actividadId={actividadId} onClose={() => setShowDetails(false)} />
            )}
        </>
    );
};

export default ActividadCard;