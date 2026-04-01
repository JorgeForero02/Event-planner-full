import React from 'react';
import { Pencil, Power, PowerOff } from 'lucide-react';
import StatusBadge from '../../../../components/ui/StatusBadge';

const LocationsList = ({ ubicaciones, onEdit, onToggle }) => {
    const getCiudadNombre = (ubicacion) =>
        ubicacion.ciudad_nombre || ubicacion.ciudad?.nombre || ubicacion.nombre_ciudad || ubicacion.ciudad || 'Sin ciudad';

    const getDescripcion = (ubicacion) =>
        ubicacion.descripcion || ubicacion.detalles || ubicacion.descripcion_lugar || 'Sin descripción';

    const isActivo = (ubicacion) => ubicacion.activo === undefined || ubicacion.activo === 1 || ubicacion.activo === true;

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                        {['Nombre', 'Dirección', 'Descripción', 'Ciudad', 'Estado', 'Acciones'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {ubicaciones.map((ubicacion, index) => {
                        const activo = isActivo(ubicacion);
                        return (
                            <tr key={ubicacion.id || index} className={`hover:bg-slate-50 transition-colors ${!activo ? 'opacity-60' : ''}`}>
                                <td className="px-4 py-3 font-medium text-slate-800">
                                    {ubicacion.lugar || ubicacion.nombre || ubicacion.lugar_nombre}
                                </td>
                                <td className="px-4 py-3 text-slate-600">{ubicacion.direccion || 'Sin dirección'}</td>
                                <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{getDescripcion(ubicacion)}</td>
                                <td className="px-4 py-3 text-slate-600">{getCiudadNombre(ubicacion)}</td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={activo ? 'habilitada' : 'deshabilitada'} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onEdit(ubicacion)}
                                            title="Editar"
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => onToggle(ubicacion)}
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

export default LocationsList;