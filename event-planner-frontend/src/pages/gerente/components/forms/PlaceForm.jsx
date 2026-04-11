import React from 'react';
import { X, MapPin, Users, AlertTriangle } from 'lucide-react';

const inputCls = 'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

const PlaceForm = ({
    formData,
    ubicaciones,
    empresa,
    onSubmit,
    onClose,
    onInputChange,
    showCreateButton,
    onShowCreateForm
}) => {
    const handleLocalInputChange = (e) => {
        const { name, value } = e.target;
        onInputChange(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-brand-500" />
                        <h2 className="text-base font-semibold text-slate-800">Crear Lugar</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {showCreateButton && (
                            <button type="button" onClick={onShowCreateForm}
                                className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors flex items-center gap-1"
                            >
                                + Crear Nuevo
                            </button>
                        )}
                        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Información de la Empresa</p>
                        <div className="h-9 flex items-center px-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700">
                            {empresa?.nombre || 'Cargando...'}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Información del Lugar</p>

                        <div>
                            <label htmlFor="nombre" className={labelCls}>Nombre *</label>
                            <input type="text" id="nombre" name="nombre"
                                value={formData.nombre} onChange={handleLocalInputChange}
                                placeholder="Nombre del lugar" required className={inputCls} />
                        </div>

                        <div>
                            <label htmlFor="id_ubicacion" className={labelCls}>Ubicación *</label>
                            {ubicaciones && ubicaciones.length > 0 ? (
                                <select id="id_ubicacion" name="id_ubicacion"
                                    value={formData.id_ubicacion} onChange={handleLocalInputChange}
                                    required
                                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                                >
                                    <option value="">Seleccione una ubicación</option>
                                    {ubicaciones.map((ubicacion) => (
                                        <option key={ubicacion.id} value={ubicacion.id}>{ubicacion.lugar}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                                    <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-700">No hay ubicaciones disponibles. Cree una ubicación primero.</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="capacidad" className={labelCls}>
                                <span className="flex items-center gap-1">
                                    <Users size={12} className="text-slate-400" />Capacidad *
                                </span>
                            </label>
                            <input type="number" id="capacidad" name="capacidad"
                                value={formData.capacidad} onChange={handleLocalInputChange}
                                placeholder="0" min="1" required className={inputCls} />
                        </div>

                        <div>
                            <label htmlFor="descripcion" className={labelCls}>Descripción *</label>
                            <textarea id="descripcion" name="descripcion"
                                value={formData.descripcion} onChange={handleLocalInputChange}
                                placeholder="Descripción del lugar" rows="4" required
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >Cancelar</button>
                        <button type="submit" disabled={!ubicaciones || ubicaciones.length === 0}
                            className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >Crear Lugar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlaceForm;
