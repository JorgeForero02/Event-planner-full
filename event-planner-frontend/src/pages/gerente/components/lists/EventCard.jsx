import React from 'react';
import { Calendar, Users, Building2, Eye } from 'lucide-react';
import { cn } from '../../../../lib/utils';

const estadoVariants = {
  publicado:  'bg-brand-100 text-brand-700 border-brand-200',
  activo:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelado:  'bg-rose-100 text-rose-700 border-rose-200',
  finalizado: 'bg-slate-100 text-slate-600 border-slate-200',
};

const progressColors = {
  publicado:  'bg-brand-500',
  activo:     'bg-emerald-500',
  cancelado:  'bg-rose-500',
  finalizado: 'bg-slate-400',
};

const EventCard = ({
  evento,
  onVerDetalles,
  formatFecha,
  formatHora,
  getEstadoEvento
}) => {
  const estado = getEstadoEvento(evento);
  const fechaInicio = formatFecha(evento.fecha_inicio || evento.fecha);
  const hora = formatHora(evento.hora);
  const claseKey = (estado.clase || '').toLowerCase();
  const badgeCls = estadoVariants[claseKey] || 'bg-slate-100 text-slate-600 border-slate-200';
  const progressCls = progressColors[claseKey] || 'bg-brand-500';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Card header */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 truncate leading-snug">
            {evento.titulo || 'Evento sin título'}
          </h3>
          <span className="text-xs text-slate-500 mt-0.5 block">
            {evento.modalidad || 'Presencial'}
          </span>
        </div>
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shrink-0', badgeCls)}>
          {estado.texto}
        </span>
      </div>

      {/* Progress bar */}
      {estado.tieneProgreso && (
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Ocupación</span>
            <span className="text-xs font-semibold text-slate-700">{estado.porcentaje}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn('h-1.5 rounded-full transition-all', progressCls)}
              style={{ width: `${estado.porcentaje}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {estado.cuposOcupados} de {estado.cuposTotales} cupos ocupados
          </p>
        </div>
      )}

      {/* Description */}
      {evento.descripcion && evento.descripcion !== 'Sin descripción disponible' && (
        <div className="px-5 pb-3">
          <p className="text-xs text-slate-500 line-clamp-2">{evento.descripcion}</p>
        </div>
      )}

      {/* Meta */}
      <div className="px-5 pb-3 flex flex-wrap gap-x-4 gap-y-1">
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Calendar size={12} className="shrink-0" />
          {fechaInicio}{hora ? ` — ${hora}` : ''}
        </span>
        {!estado.tieneProgreso && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Users size={12} className="shrink-0" />
            {estado.cuposTotales > 0 ? `${estado.cuposTotales} cupos` : 'Sin límite'}
          </span>
        )}
        {evento.creador && evento.creador !== 'No especificado' && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Building2 size={12} className="shrink-0" />
            {typeof evento.creador === 'string' ? evento.creador : evento.creador?.nombre}
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="mt-auto px-5 pb-5">
        <button
          onClick={() => onVerDetalles(evento)}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold hover:bg-brand-100 transition-colors border border-brand-200"
        >
          <Eye size={14} />
          Ver Detalles
        </button>
      </div>
    </div>
  );
};

export default EventCard;
