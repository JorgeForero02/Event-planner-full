import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';

const EncuestaModal = ({
    encuesta,
    tipoTexto,
    estado,
    onClose,
    onCompletar,
    confirmandoCompletar,
    color,
    esEncuestaEvento = false,
    eventoNombre = '',
    idAsistente = null
}) => {
    const esCompletada = estado.estado === 'completada';
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const handleAccederFormulario = () => {
        window.open(encuesta.url_google_form, '_blank');
        if (!esCompletada) {
            setMostrarConfirmacion(true);
        }
    };

    const handleConfirmarCompletar = () => {
        onCompletar();
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {esCompletada ? 'Encuesta Completada' : encuesta.titulo}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {!mostrarConfirmacion ? (
                        <>
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                                <span
                                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                                    style={{ backgroundColor: color }}
                                >
                                    {tipoTexto}
                                </span>
                                {encuesta.obligatoria && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/20">
                                        Obligatoria
                                    </span>
                                )}
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${esCompletada ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                                    {esCompletada ? 'Completada' : 'Pendiente'}
                                </span>
                            </div>

                            {/* Description */}
                            {encuesta.descripcion && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-1">Descripción:</p>
                                    <p className="text-sm text-slate-700">{encuesta.descripcion}</p>
                                </div>
                            )}

                            {/* Details */}
                            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                                <p className="text-xs font-semibold text-slate-500 mb-1">Detalles:</p>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Período:</span>
                                    <span className="text-slate-700 font-medium">
                                        {encuesta.fecha_inicio ? new Date(encuesta.fecha_inicio).toLocaleDateString() : 'Sin fecha'}
                                        {encuesta.fecha_fin && ` - ${new Date(encuesta.fecha_fin).toLocaleDateString()}`}
                                    </span>
                                </div>
                                {encuesta.respuestas?.[0]?.fecha_envio && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Enviada:</span>
                                        <span className="text-slate-700 font-medium">{new Date(encuesta.respuestas[0].fecha_envio).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {esCompletada && encuesta.respuestas?.[0]?.fecha_completado && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Completada:</span>
                                        <span className="text-slate-700 font-medium">
                                            {(() => {
                                                const r = encuesta.respuestas?.find(r => r.id_asistente === idAsistente);
                                                return r?.fecha_completado ? new Date(r.fecha_completado).toLocaleDateString() : 'Fecha no disponible';
                                            })()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {!esCompletada ? (
                                <div className="space-y-2">
                                    <button
                                        onClick={handleAccederFormulario}
                                        className="w-full h-10 rounded-lg text-sm font-semibold text-white transition-colors"
                                        style={{ backgroundColor: color }}
                                    >
                                        Acceder al Formulario Google
                                    </button>
                                    <p className="text-xs text-slate-400 text-center">
                                        Haz clic para abrir el formulario. Una vez completado, regresa aquí para marcarlo.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-success/5 border border-success/20 rounded-lg p-3">
                                    <div>
                                        <p className="text-sm font-semibold text-success">Encuesta Completada</p>
                                        <p className="text-xs text-slate-500">Has completado exitosamente esta encuesta.</p>
                                    </div>
                                    <button
                                        onClick={() => window.open(encuesta.url_google_form, '_blank')}
                                        className="h-8 px-3 rounded-lg text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                                    >
                                        Ver Formulario
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800">¿Completaste el formulario exitosamente?</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Por favor confirma que has terminado de completar el formulario de Google.
                                    Una vez confirmado, tu respuesta será registrada como completada.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setMostrarConfirmacion(false)}
                                    disabled={confirmandoCompletar}
                                    className="flex-1 h-9 rounded-lg text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-60"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={handleConfirmarCompletar}
                                    disabled={confirmandoCompletar}
                                    className="flex-1 h-9 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-60"
                                    style={{ backgroundColor: color }}
                                >
                                    {confirmandoCompletar ? 'Confirmando...' : 'Sí, completé el formulario'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EncuestaModal;