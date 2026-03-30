import React from 'react';
import { CalendarDays } from 'lucide-react';
import EventCard from './EventCard';

const EventsList = ({
    eventos,
    onVerDetalles,
    formatFecha,
    formatHora,
    getLugarTexto,
    getEstadoEvento,
    sidebarCollapsed
}) => {
    if (eventos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                    <CalendarDays size={28} className="text-slate-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-700">No hay eventos disponibles</h3>
                    <p className="text-xs text-slate-400 mt-1">No se encontraron eventos con los filtros aplicados.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {eventos.map((evento) => (
                <EventCard
                    key={evento.id}
                    evento={evento}
                    onVerDetalles={onVerDetalles}
                    formatFecha={formatFecha}
                    formatHora={formatHora}
                    getLugarTexto={getLugarTexto}
                    getEstadoEvento={getEstadoEvento}
                />
            ))}
        </div>
    );
};

export default EventsList;
