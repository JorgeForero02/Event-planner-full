import React from 'react';
import { Calendar, Users, Building2, Eye } from 'lucide-react';
import { formatRangoFechas, debugFecha } from '../../../asistente/utils/dateUtils';

const STATUS_CLASSES = {
    'CUPOS AGOTADOS': 'bg-red-50 text-red-700 border border-red-200',
    'FINALIZADO':     'bg-slate-100 text-slate-600 border border-slate-200',
    'POR COMENZAR':   'bg-amber-50 text-amber-700 border border-amber-200',
    'EN CURSO':       'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'DISPONIBLE':     'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const EventCard = ({ evento, estado, onViewDetails, formatFecha, formatHora }) => {

    React.useEffect(() => {
        debugFecha(evento.fecha_inicio, 'Fecha inicio');
        debugFecha(evento.fecha_fin, 'Fecha fin');
    }, [evento]);

    const rangoFechas = formatRangoFechas(evento.fecha_inicio, evento.fecha_fin);
    const hora = formatHora(evento.hora);

    const calcularPorcentaje = () => {
        if (!evento.cupo_total || evento.cupo_total === 0) return 0;
        return Math.round((evento.cupos_disponibles / evento.cupo_total) * 100);
    };

    const porcentaje = calcularPorcentaje();

    const progressColor =
        porcentaje === 0 ? 'bg-danger' :
        porcentaje <= 30 ? 'bg-danger' :
        porcentaje <= 70 ? 'bg-warning' : 'bg-success';

    const statusCls = STATUS_CLASSES[estado.texto] || STATUS_CLASSES['DISPONIBLE'];

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                        {evento.titulo || evento.nombre || 'Evento sin tÃ­tulo'}
                    </h3>
                    <span className="text-xs text-slate-400 mt-0.5">{evento.modalidad || 'Presencial'}</span>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${statusCls}`}>
                    {estado.texto}
                </span>
            </div>

            <div className="px-5 pb-4 flex-1 flex flex-col gap-3">
                {/* Capacity bar */}
                {evento.cupo_total > 0 && (
                    <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500">Cupos disponibles</span>
                            <span className="font-semibold text-slate-700">{porcentaje}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${porcentaje}%` }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{evento.cupos_disponibles} de {evento.cupo_total} cupos disponibles</p>
                    </div>
                )}

                {/* Description */}
                {evento.descripcion && evento.descripcion !== 'Sin descripciÃ³n disponible' && (
                    <p className="text-xs text-slate-500 line-clamp-2">{evento.descripcion}</p>
                )}

                {/* Details */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={12} className="text-slate-400 shrink-0" />
                        <span>{rangoFechas}{hora && ` Â· ${hora}`}</span>
                    </div>
                    {evento.cupo_total > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Users size={12} className="text-slate-400 shrink-0" />
                            <span>{evento.cupos_disponibles} cupos disponibles</span>
                        </div>
                    )}
                    {evento.empresa && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Building2 size={12} className="text-slate-400 shrink-0" />
                            <span>{evento.empresa}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <button
                    onClick={() => onViewDetails(evento)}
                    className="mt-auto w-full h-9 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors flex items-center justify-center gap-1.5">
                    <Eye size={13} />
                    Ver Detalles Completos
                </button>
            </div>
        </div>
    );
};

export default EventCard;
