import React from 'react';
import { Calendar, Users, Building2, Eye, CheckCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { formatRangoFechas } from '../../utils/dateUtils';

const progressBarColor = (porcentaje, texto) => {
    if (texto === 'INSCRITO') return 'bg-brand-500';
    if (texto === 'CUPOS AGOTADOS' || porcentaje === 0) return 'bg-danger';
    if (porcentaje <= 30) return 'bg-danger';
    if (porcentaje <= 70) return 'bg-warning';
    return 'bg-success';
};

const statusToKey = (texto) => {
    switch (texto) {
        case 'INSCRITO': return 'confirmado';
        case 'CUPOS AGOTADOS': return 'cerrada';
        case 'FINALIZADO': return 'finalizado';
        case 'POR COMENZAR': return 'publicado';
        case 'DISPONIBLE': return 'activo';
        default: return 'borrador';
    }
};

const EventCard = ({ evento, estado, onViewDetails, onInscribe, formatFecha, formatHora }) => {
    const rangoFechas = formatRangoFechas(evento.fecha_inicio, evento.fecha_fin);
    const hora = formatHora(evento.hora);

    const porcentaje = (evento.cupo_total > 0)
        ? Math.round((evento.cupos_disponibles / evento.cupo_total) * 100)
        : 0;

    const canInscribe = estado.texto === 'DISPONIBLE' || estado.texto === 'POR COMENZAR';
    const isInscrito = estado.texto === 'INSCRITO';

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">

            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 leading-snug truncate">
                        {evento.titulo || evento.nombre || 'Evento sin título'}
                    </h3>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                        {evento.modalidad || 'Presencial'}
                    </span>
                </div>
                <StatusBadge status={statusToKey(estado.texto)} label={estado.texto} className="shrink-0" />
            </div>

            {/* Capacity bar */}
            {evento.cupo_total > 0 && (
                <div className="px-5 pb-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">Cupos disponibles</span>
                        <span className="text-xs font-semibold text-slate-700">{porcentaje}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className={cn('h-1.5 rounded-full transition-all', progressBarColor(porcentaje, estado.texto))}
                            style={{ width: `${porcentaje}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        {evento.cupos_disponibles} de {evento.cupo_total} cupos disponibles
                    </p>
                </div>
            )}

            {/* Description */}
            {evento.descripcion && evento.descripcion !== 'Sin descripción disponible' && (
                <div className="px-5 pb-3">
                    <p className="text-xs text-slate-500 line-clamp-2">{evento.descripcion}</p>
                </div>
            )}

            {/* Details row */}
            <div className="px-5 pb-3 flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar size={12} className="shrink-0" />
                    {rangoFechas}{hora ? ` - ${hora}` : ''}
                </span>
                {evento.cupo_total > 0 && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Users size={12} className="shrink-0" />
                        {evento.cupos_disponibles} cupos
                    </span>
                )}
                {evento.empresa && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Building2 size={12} className="shrink-0" />
                        {evento.empresa}
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="mt-auto px-5 pb-5 flex gap-2">
                <button
                    onClick={() => onViewDetails(evento)}
                    className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors border border-slate-200"
                >
                    <Eye size={14} />
                    Ver Detalles Completos
                </button>
                <button
                    onClick={() => onInscribe(evento)}
                    disabled={!canInscribe}
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-xs font-semibold transition-colors',
                        isInscrito
                            ? 'bg-success/10 text-success border border-success/30 cursor-default'
                            : canInscribe
                                ? 'bg-brand-600 text-white hover:bg-brand-700'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    )}
                >
                    {isInscrito && <CheckCircle size={14} />}
                    {isInscrito ? 'Inscrito' : canInscribe ? 'Inscribirse' : estado.texto}
                </button>
            </div>
        </div>
    );
};

export default EventCard;