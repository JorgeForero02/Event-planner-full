import React from 'react';
import StatusBadge from '../../../../components/ui/StatusBadge';

const EncuestaCard = ({
    encuesta,
    color,
    tipoTexto,
    estado,
    onAcceder,
    onCompletar,
    loading,
    esEncuestaEvento = false,
    eventoNombre = '',
    idAsistente = null
}) => {
    const esObligatoria = encuesta.obligatoria;
    const esCompletada = estado.estado === 'completada';
    const esPendiente = estado.estado === 'pendiente';

    const esEncuestaActividad = encuesta.id_actividad !== null;
    const esEncuestaSatisfaccion = encuesta.tipo_encuesta === 'satisfaccion_evento';

    const getRespuestaAsistente = () => {
        if (!idAsistente || !encuesta.respuestas || encuesta.respuestas.length === 0) {
            return null;
        }
        return encuesta.respuestas.find(respuesta =>
            respuesta.id_asistente === idAsistente
        );
    };

    const respuestaAsistente = getRespuestaAsistente();

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Colored header strip */}
            <div
                className="px-5 pt-4 pb-3 border-l-4"
                style={{ backgroundColor: color + '18', borderLeftColor: color }}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 leading-snug">{encuesta.titulo}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span
                                className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                                style={{ backgroundColor: color }}
                            >
                                {tipoTexto}
                            </span>
                            {esObligatoria && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/20">
                                    Obligatoria
                                </span>
                            )}
                        </div>
                    </div>
                    <StatusBadge status={estado.estado} className="shrink-0" />
                </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 flex flex-col gap-3 flex-1">
                {encuesta.descripcion && (
                    <p className="text-xs text-slate-500 line-clamp-2">{encuesta.descripcion}</p>
                )}

                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Asociada a:</span>
                        <span className="text-slate-600 font-medium">
                            {esEncuestaSatisfaccion ? 'Todo el evento' : esEncuestaActividad ? 'Actividad específica' : 'No especificado'}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Período:</span>
                        <span className="text-slate-600 font-medium">
                            {encuesta.fecha_inicio ? new Date(encuesta.fecha_inicio).toLocaleDateString() : 'Sin fecha'}
                            {encuesta.fecha_fin && ` - ${new Date(encuesta.fecha_fin).toLocaleDateString()}`}
                        </span>
                    </div>
                    {respuestaAsistente?.fecha_envio && (
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Enviada:</span>
                            <span className="text-slate-600 font-medium">{new Date(respuestaAsistente.fecha_envio).toLocaleDateString()}</span>
                        </div>
                    )}
                    {esCompletada && respuestaAsistente?.fecha_completado && (
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Completada:</span>
                            <span className="text-slate-600 font-medium">{new Date(respuestaAsistente.fecha_completado).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-2">
                    {!esCompletada ? (
                        <button
                            onClick={onAcceder}
                            disabled={loading}
                            className="w-full h-9 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-60"
                            style={{ backgroundColor: color }}
                        >
                            {esPendiente ? 'Continuar Encuesta' : 'Acceder a Encuesta'}
                        </button>
                    ) : (
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-success font-medium">Encuesta completada</span>
                            <button
                                onClick={onAcceder}
                                className="h-8 px-3 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
                            >
                                Ver Respuesta
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EncuestaCard;