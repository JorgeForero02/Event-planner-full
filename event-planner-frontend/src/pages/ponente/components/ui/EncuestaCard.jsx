import React, { useState } from 'react';
import StatusBadge from '../../../../components/ui/StatusBadge';

const EncuestaCard = ({ encuesta, onEdit, onDelete, onEnviar, onVerEstadisticas }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getTipoText = (tipo) => {
        switch (tipo) {
            case 'pre_actividad': return 'Pre-Actividad';
            case 'durante_actividad': return 'Durante Actividad';
            case 'post_actividad': return 'Post-Actividad';
            default: return tipo;
        }
    };

    const getMomentoText = (momento) => {
        switch (momento) {
            case 'antes': return 'Pre-Actividad';
            case 'durante': return 'Durante Actividad';
            case 'despues': return 'Post-Actividad';
            default: return momento;
        }
    };

    const totalRespuestas = encuesta.respuestas?.length || 0;
    const completadas = encuesta.respuestas?.filter(r => r.estado === 'completada').length || 0;
    const tasaRespuesta = totalRespuestas > 0 ? ((completadas / totalRespuestas) * 100).toFixed(1) : 0;

    const handleMenuToggle = (e) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        onEdit(encuesta);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        onDelete(encuesta.id);
    };

    const handleEnviar = (e) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        onEnviar(encuesta.id);
    };

    const handleVerEstadisticas = (e) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        onVerEstadisticas(encuesta);
    };

    const borderColor = { borrador: '#6b7280', activa: '#059669', cerrada: '#dc2626' }[encuesta.estado] ?? '#6b7280';
    const tipoBg = encuesta.estado === 'activa' ? '#2C5F7C' : encuesta.estado === 'cerrada' ? '#dc2626' : '#6b7280';

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
            style={{ borderLeftColor: borderColor, borderLeftWidth: '4px' }}>

            {/* Header */}
            <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="text-sm font-semibold text-slate-800 leading-snug">{encuesta.titulo}</h3>
                    <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: tipoBg }}>
                            {getTipoText(encuesta.tipo_encuesta)}
                        </span>
                        {encuesta.obligatoria && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Obligatoria
                            </span>
                        )}
                        <StatusBadge status={encuesta.estado} />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {encuesta.estado === 'activa' && (
                        <button onClick={handleEnviar}
                            className="h-8 px-3 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors flex items-center gap-1.5">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Enviar
                        </button>
                    )}
                    <div className="relative">
                        <button onClick={handleMenuToggle}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            aria-label="Opciones">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="6" r="2" fill="currentColor" />
                                <circle cx="12" cy="12" r="2" fill="currentColor" />
                                <circle cx="12" cy="18" r="2" fill="currentColor" />
                            </svg>
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg border border-slate-200 shadow-lg z-20 overflow-hidden">
                                <button onClick={handleEdit}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" />
                                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Editar
                                </button>
                                <button onClick={handleDelete}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-red-50 transition-colors">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6H21M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Eliminar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-5 pb-4 space-y-2 flex-1">
                {encuesta.descripcion && (
                    <p className="text-xs text-slate-500 leading-relaxed">{encuesta.descripcion}</p>
                )}

                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Asociada a:</span>
                        <span className="text-slate-600 font-medium">Actividad especÃ­fica</span>
                    </div>
                    {encuesta.fecha_inicio && encuesta.fecha_fin && (
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">PerÃ­odo:</span>
                            <span className="text-slate-600">{new Date(encuesta.fecha_inicio).toLocaleDateString()} - {new Date(encuesta.fecha_fin).toLocaleDateString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Momento:</span>
                        <span className="text-slate-600 font-medium">{getMomentoText(encuesta.momento)}</span>
                    </div>
                </div>

                {encuesta.estado === 'activa' && totalRespuestas > 0 && (
                    <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-500">{completadas}/{totalRespuestas} completadas ({tasaRespuesta}%)</span>
                        <button onClick={handleVerEstadisticas}
                            className="h-8 px-3 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                            Ver EstadÃ­sticas
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EncuestaCard;
