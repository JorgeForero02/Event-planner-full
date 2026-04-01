import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';

const ResponderInvitacionModal = ({ actividad, onClose, onSubmit }) => {
    const [respuesta, setRespuesta] = useState('');
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'No definida';
        const date = new Date(dateString);
        const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

        return adjustedDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getValorActual = (campo) => {
        switch (campo) {
            case 'fecha_actividad':
                return formatDateForDisplay(actividad.fecha);
            case 'hora_inicio':
                return actividad.hora_inicio ? actividad.hora_inicio.substring(0, 5) : 'No definida';
            case 'hora_fin':
                return actividad.hora_fin ? actividad.hora_fin.substring(0, 5) : 'No definida';
            case 'titulo':
                return actividad.nombre || actividad.titulo || 'No definido';
            case 'descripcion':
                return actividad.descripcion || 'No disponible';
            case 'ubicacion':
                return actividad.ubicacion || 'No asignada';
            default:
                return 'No disponible';
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!respuesta) {
            newErrors.respuesta = 'Por favor, selecciona una respuesta';
        }

        if (respuesta === 'rechazar' && !motivoRechazo.trim()) {
            newErrors.motivoRechazo = 'Por favor, proporciona un motivo para el rechazo';
        } else if (respuesta === 'rechazar' && motivoRechazo.trim().length < 10) {
            newErrors.motivoRechazo = 'El motivo del rechazo debe tener al menos 10 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const datosEnvio = {
                aceptar: respuesta === 'aceptar'
            };

            if (respuesta === 'rechazar') {
                datosEnvio.motivo_rechazo = motivoRechazo.trim();
            }

            await onSubmit(datosEnvio);

        } catch (error) {
            console.error('Error al enviar respuesta:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Responder Invitación</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Información de la actividad */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-slate-700">Actividad</h3>
                        <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-sm space-y-1">
                            <p><strong>Título:</strong> {getValorActual('titulo')}</p>
                            <p><strong>Fecha:</strong> {getValorActual('fecha_actividad')}</p>
                            <p><strong>Horario:</strong> {getValorActual('hora_inicio')} - {getValorActual('hora_fin')}</p>
                            <p><strong>Ubicación:</strong> {getValorActual('ubicacion')}</p>
                        </div>
                    </div>

                    {/* Selección de respuesta */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-slate-700">Tu Respuesta</h3>

                        <div className="space-y-2">
                            <label className="flex items-start gap-3 p-3 rounded-md border border-slate-200 cursor-pointer hover:bg-slate-50">
                                <input
                                    type="radio"
                                    name="respuesta"
                                    value="aceptar"
                                    checked={respuesta === 'aceptar'}
                                    onChange={(e) => setRespuesta(e.target.value)}
                                    className="mt-0.5"
                                />
                                <div>
                                    <p className="text-sm font-medium">Aceptar Invitación</p>
                                    <p className="text-xs text-slate-500">Confirmas tu participación en esta actividad</p>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 p-3 rounded-md border border-slate-200 cursor-pointer hover:bg-slate-50">
                                <input
                                    type="radio"
                                    name="respuesta"
                                    value="rechazar"
                                    checked={respuesta === 'rechazar'}
                                    onChange={(e) => setRespuesta(e.target.value)}
                                    className="mt-0.5"
                                />
                                <div>
                                    <p className="text-sm font-medium">Rechazar Invitación</p>
                                    <p className="text-xs text-slate-500">No podrás participar en esta actividad</p>
                                </div>
                            </label>
                        </div>

                        {errors.respuesta && (
                            <p className="text-sm text-danger">{errors.respuesta}</p>
                        )}
                    </div>

                    {/* Motivo de rechazo (solo si se selecciona rechazar) */}
                    {respuesta === 'rechazar' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-700">Motivo del Rechazo</h3>
                            <div className="space-y-2">
                                <Label>Explica por qué no puedes participar:</Label>
                                <Textarea
                                    value={motivoRechazo}
                                    onChange={(e) => setMotivoRechazo(e.target.value)}
                                    placeholder="Describe los motivos por los cuales no puedes participar (conflicto de horario, indisponibilidad, etc.)"
                                    rows="4"
                                    className={errors.motivoRechazo ? 'border-danger' : ''}
                                />
                                {errors.motivoRechazo && (
                                    <p className="text-sm text-danger">{errors.motivoRechazo}</p>
                                )}
                            </div>
                        </div>
                    )}

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
                            variant={respuesta === 'aceptar' ? 'success' : 'destructive'}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Enviando...' : respuesta === 'aceptar' ? 'Aceptar Invitación' : 'Rechazar Invitación'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ResponderInvitacionModal;
