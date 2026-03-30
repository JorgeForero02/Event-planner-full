import React from 'react';
import { Search, X } from 'lucide-react';

const EventFilters = ({
    searchTerm,
    filtroOrganizador,
    organizadores,
    eventosCount,
    totalEventos,
    onSearchChange,
    onOrganizadorChange,
    onClearFilters,
    hasActiveFilters
}) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar eventos por nombre..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                    />
                </div>

                {/* Organizer filter */}
                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Organizador:</label>
                    <select
                        value={filtroOrganizador}
                        onChange={(e) => onOrganizadorChange(e.target.value)}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    >
                        <option value="">Todos</option>
                        {organizadores.map((org) => (
                            <option key={org.id} value={org.nombre}>{org.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                    Mostrando <strong className="text-slate-700">{eventosCount}</strong> de {totalEventos} eventos
                    {filtroOrganizador && ` — ${filtroOrganizador}`}
                </span>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors"
                    >
                        <X size={12} /> Limpiar filtros
                    </button>
                )}
            </div>
        </div>
    );
};

export default EventFilters;