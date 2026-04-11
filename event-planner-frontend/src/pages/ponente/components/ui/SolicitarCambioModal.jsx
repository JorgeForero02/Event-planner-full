import { useState, useEffect } from 'react';
import { API_PREFIX } from '../../../../config/apiConfig';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Button } from '../../../../components/ui/button';
const API_BASE = API_PREFIX;

const SolicitudCambioModal = ({ actividad, onClose, onSubmit }) => {

    const [actividadCompleta, setActividadCompleta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lugaresDisponibles, setLugaresDisponibles] = useState([]);

    useEffect(() => {
        const cargarActividadCompleta = async () => {
            try {
                setLoading(true);

                const token = localStorage.getItem('access_token');
                const actividadId = actividad?.id_actividad || actividad?.id;

                if (actividadId && token) {
                    try {
                        const lugaresRes = await fetch(`${API_BASE}/actividades/${actividadId}/lugares`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (lugaresRes.ok) {
                            const lugaresData = await lugaresRes.json();
                            setLugaresDisponibles(lugaresData.data || []);
                        }
                    } catch {
                        // no-op — dropdown stays empty
                    }
                }

                if (actividad?.lugares || actividad?.actividad?.lugares) {
                    setActividadCompleta(actividad);
                    setLoading(false);
                    return;
                }

                if (!token) {
                    throw new Error('No hay token de autenticación');
                }

                const ponenteId = actividad?.id_ponente;

                if (!ponenteId || !actividadId) {
                    throw new Error('Faltan IDs para obtener los datos completos');
                }

                const response = await fetch(
                    `${API_BASE}/ponente-actividad/${ponenteId}/${actividadId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();

                if (result.success && result.data?.actividad) {
                    setActividadCompleta(result.data.actividad);
                } else {
                    setActividadCompleta(actividad);
                }

            } catch (error) {
                setError(error.message);
                setActividadCompleta(actividad);
            } finally {
                setLoading(false);
            }
        };

        cargarActividadCompleta();
    }, [actividad]);

    const [formData, setFormData] = useState({
        cambios_solicitados: {
            fecha_actividad: '',
            hora_inicio: '',
            hora_fin: '',
            titulo: '',
            descripcion: '',
            ubicacion: ''
        },
        tipo_cambio: [],
        justificacion: ''
    });

    const [errors, setErrors] = useState({});
    // eslint-disable-next-line no-unused-vars
    const [_showNotification, setShowNotification] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [_notificationMessage, setNotificationMessage] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [_notificationType, setNotificationType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // eslint-disable-next-line no-unused-vars
    function _formatDateForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        const year = adjustedDate.getFullYear();
        const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
        const day = String(adjustedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatDateForDisplay(dateString) {
        if (!dateString) return 'No definida';
        const date = new Date(dateString);
        const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

        return adjustedDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const showAlert = (message, type = 'error') => {
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotification(true);

        setTimeout(() => {
            setShowNotification(false);
        }, 5000);
    };

    const handleInputChange = (field, value) => {
        if (field.startsWith('cambios_solicitados.')) {
            const subField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                cambios_solicitados: {
                    ...prev.cambios_solicitados,
                    [subField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        const cambiosSolicitados = Object.entries(formData.cambios_solicitados)
            .some(([key, value]) => {
                if (value && value.trim() !== '') {
                    return true;
                }
                return false;
            });

        if (!cambiosSolicitados) {
            newErrors.cambios = 'Por favor, especifica al menos un cambio solicitado';
        }

        if (cambiosSolicitados) {
            if (!formData.justificacion || !formData.justificacion.trim()) {
                newErrors.justificacion = 'Por favor, proporciona una justificación para el cambio';
            } else if (formData.justificacion.trim().length < 10) {
                newErrors.justificacion = 'La justificación debe tener al menos 10 caracteres';
            }
        }

        if ((formData.cambios_solicitados.hora_inicio && !formData.cambios_solicitados.hora_fin) ||
            (!formData.cambios_solicitados.hora_inicio && formData.cambios_solicitados.hora_fin)) {
            newErrors.horario = 'Si modificas el horario, debes especificar tanto la hora de inicio como la de fin';
        }

        if (formData.cambios_solicitados.fecha_actividad) {
            const selectedDate = new Date(formData.cambios_solicitados.fecha_actividad);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                newErrors.fecha = 'No puedes seleccionar una fecha en el pasado';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!validateForm()) {
            showAlert('Por favor, corrige los errores en el formulario', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            const cambiosFiltrados = {};
            Object.entries(formData.cambios_solicitados).forEach(([key, value]) => {
                if (value && value.trim() !== '') {
                    cambiosFiltrados[key] = value.trim();
                }
            });

            const justificacion = formData.justificacion.trim();

            const datosEnvio = {
                cambios_solicitados: cambiosFiltrados,
                tipo_cambio: formData.tipo_cambio,
                justificacion: justificacion
            };

            await onSubmit(datosEnvio);

            showAlert('Tu solicitud de cambio ha sido enviada para revisión', 'success');

            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (error) {

            if (error.message && error.message.includes('400')) {
                showAlert('Error: La justificación es requerida o muy corta', 'error');
            } else if (error.message && error.message.includes('network')) {
                showAlert('Error de conexión. Verifica tu internet e intenta nuevamente.', 'error');
            } else {
                showAlert('Error al enviar la solicitud. Por favor, intenta nuevamente.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getUbicacionCompleta = (actividad) => {
        if (!actividad) return 'No asignada';

        const lugares = actividad.lugares || actividad.actividad?.lugares;

        if (!lugares || lugares.length === 0) {
            return 'No asignada';
        }

        const lugar = lugares[0];
        const partes = [];

        if (lugar.nombre?.trim()) {
            partes.push(lugar.nombre.trim());
        }

        if (lugar.ubicacion) {
            if (lugar.ubicacion.lugar?.trim()) {
                partes.push(lugar.ubicacion.lugar.trim());
            }
            if (lugar.ubicacion.direccion?.trim()) {
                partes.push(lugar.ubicacion.direccion.trim());
            }
        }

        if (lugar.descripcion?.trim()) {
            partes.push(lugar.descripcion.trim());
        }

        return partes.length > 0 ? partes.join(' - ') : 'No asignada';
    };

    const getValorActual = (campo) => {
        const datos = actividadCompleta || actividad;

        switch (campo) {
            case 'fecha_actividad':
                const fecha = datos?.fecha_actividad || datos?.fecha;
                return formatDateForDisplay(fecha);
            case 'hora_inicio':
                return datos?.hora_inicio ? datos.hora_inicio.substring(0, 5) : 'No definida';
            case 'hora_fin':
                return datos?.hora_fin ? datos.hora_fin.substring(0, 5) : 'No definida';
            case 'titulo':
                return datos?.titulo || datos?.nombre || 'No definido';
            case 'descripcion':
                return datos?.descripcion || 'No disponible';
            case 'ubicacion':
                return getUbicacionCompleta(datos);
            default:
                return 'No disponible';
        }
    };

    const clearField = (field) => {
        handleInputChange(`cambios_solicitados.${field}`, '');
    };

    if (loading) {
        return (
            <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Solicitar Cambio de Actividad</DialogTitle>
                    </DialogHeader>
                    <div className="py-8 text-center text-sm text-slate-500">
                        Cargando información de la actividad...
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (error) {
    }

    return (
        <Dialog open={true} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Solicitar Cambio de Actividad</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-slate-700">Actividad Actual</h3>
                        <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-sm space-y-1">
                            <p><strong>Título:</strong> {getValorActual('titulo')}</p>
                            <p><strong>Fecha:</strong> {getValorActual('fecha_actividad')}</p>
                            <p><strong>Horario:</strong> {getValorActual('hora_inicio')} - {getValorActual('hora_fin')}</p>
                            <p><strong>Ubicación:</strong> {getValorActual('ubicacion')}</p>
                            {error && (
                                <p className="text-xs text-amber-600">
                                    Nota: No se pudieron cargar todos los detalles de la actividad
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700">Cambios Solicitados</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Completa solo los campos que deseas modificar. No es necesario completar todos.
                            </p>
                        </div>

                        {errors.cambios && (
                            <p className="text-sm text-danger">{errors.cambios}</p>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Nueva Fecha:</Label>
                                {formData.cambios_solicitados.fecha_actividad && (
                                    <button
                                        type="button"
                                        className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                                        onClick={() => clearField('fecha_actividad')}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <Input
                                type="date"
                                value={formData.cambios_solicitados.fecha_actividad}
                                onChange={(e) => handleInputChange('cambios_solicitados.fecha_actividad', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <p className="text-xs text-slate-500">Actual: {getValorActual('fecha_actividad')}</p>
                            {errors.fecha && (
                                <p className="text-sm text-danger">{errors.fecha}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Nueva Hora de Inicio:</Label>
                                    {formData.cambios_solicitados.hora_inicio && (
                                        <button
                                            type="button"
                                            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                                            onClick={() => clearField('hora_inicio')}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                <Input
                                    type="time"
                                    value={formData.cambios_solicitados.hora_inicio}
                                    onChange={(e) => handleInputChange('cambios_solicitados.hora_inicio', e.target.value)}
                                />
                                <p className="text-xs text-slate-500">Actual: {getValorActual('hora_inicio')}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Nueva Hora de Fin:</Label>
                                    {formData.cambios_solicitados.hora_fin && (
                                        <button
                                            type="button"
                                            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                                            onClick={() => clearField('hora_fin')}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                <Input
                                    type="time"
                                    value={formData.cambios_solicitados.hora_fin}
                                    onChange={(e) => handleInputChange('cambios_solicitados.hora_fin', e.target.value)}
                                />
                                <p className="text-xs text-slate-500">Actual: {getValorActual('hora_fin')}</p>
                            </div>
                        </div>

                        {errors.horario && (
                            <p className="text-sm text-danger">{errors.horario}</p>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Nuevo Título:</Label>
                                {formData.cambios_solicitados.titulo && (
                                    <button
                                        type="button"
                                        className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                                        onClick={() => clearField('titulo')}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <Input
                                type="text"
                                value={formData.cambios_solicitados.titulo}
                                onChange={(e) => handleInputChange('cambios_solicitados.titulo', e.target.value)}
                                placeholder="Nuevo título para la actividad"
                            />
                            <p className="text-xs text-slate-500">Actual: {getValorActual('titulo')}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Nueva Descripción:</Label>
                                {formData.cambios_solicitados.descripcion && (
                                    <button
                                        type="button"
                                        className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                                        onClick={() => clearField('descripcion')}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <Textarea
                                value={formData.cambios_solicitados.descripcion}
                                onChange={(e) => handleInputChange('cambios_solicitados.descripcion', e.target.value)}
                                placeholder="Nueva descripción para la actividad"
                                rows="3"
                            />
                            <p className="text-xs text-slate-500">Actual: {getValorActual('descripcion')}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Nueva Ubicación:</Label>
                                {formData.cambios_solicitados.ubicacion && (
                                    <button
                                        type="button"
                                        className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                                        onClick={() => clearField('ubicacion')}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <select
                                value={formData.cambios_solicitados.ubicacion}
                                onChange={(e) => handleInputChange('cambios_solicitados.ubicacion', e.target.value)}
                                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                            >
                                <option value="">Seleccionar nueva ubicación...</option>
                                {lugaresDisponibles.map(lugar => {
                                    const partes = [lugar.nombre];
                                    if (lugar.ubicacion?.lugar) partes.push(lugar.ubicacion.lugar);
                                    if (lugar.ubicacion?.direccion) partes.push(lugar.ubicacion.direccion);
                                    const label = partes.join(' - ');
                                    return (
                                        <option key={lugar.id} value={label}>{label}</option>
                                    );
                                })}
                            </select>
                            <p className="text-xs text-slate-500">Actual: {getValorActual('ubicacion')}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-slate-700">Justificación *</h3>
                        <div className="space-y-2">
                            <Label>Explica por qué necesitas este cambio:</Label>
                            <Textarea
                                value={formData.justificacion}
                                onChange={(e) => handleInputChange('justificacion', e.target.value)}
                                placeholder="Describe los motivos para solicitar el cambio (conflicto de horario, disponibilidad, recursos, etc.)"
                                rows="4"
                                className={errors.justificacion ? 'border-danger' : ''}
                            />
                            {errors.justificacion && (
                                <p className="text-sm text-danger">{errors.justificacion}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SolicitudCambioModal;
