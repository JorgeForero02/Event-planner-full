import React from 'react';
import { Pencil, Power, PowerOff } from 'lucide-react';
import StatusBadge from '../../../../components/ui/StatusBadge';

const PlacesList = ({ lugares, onEdit, onToggle }) => {
    const isActivo = (lugar) => lugar.activo === undefined || lugar.activo === 1 || lugar.activo === true;

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                        {['Nombre', 'Descripción', 'Ubicación', 'Capacidad', 'Estado', 'Acciones'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {lugares.map((lugar) => {
                        const activo = isActivo(lugar);
                        return (
                            <tr key={lugar.id} className={`hover:bg-slate-50 transition-colors ${!activo ? 'opacity-60' : ''}`}>
                                <td className="px-4 py-3 font-medium text-slate-800">{lugar.nombre || 'Sin nombre'}</td>
                                <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{lugar.descripcion || 'Sin descripción'}</td>
                                <td className="px-4 py-3 text-slate-600">{lugar.ubicacion_nombre || 'Sin ubicación'}</td>
                                <td className="px-4 py-3">
                                    {lugar.capacidad
                                        ? <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">{lugar.capacidad}</span>
                                        : <span className="text-slate-400">-</span>}
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={activo ? 'habilitado' : 'deshabilitado'} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onEdit(lugar)}
                                            title="Editar"
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => onToggle(lugar)}
                                            title={activo ? 'Deshabilitar' : 'Habilitar'}
                                            className={`p-1.5 rounded-lg transition-colors ${activo ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-500 hover:text-green-600 hover:bg-green-50'}`}
                                        >
                                            {activo ? <PowerOff size={15} /> : <Power size={15} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default PlacesList;