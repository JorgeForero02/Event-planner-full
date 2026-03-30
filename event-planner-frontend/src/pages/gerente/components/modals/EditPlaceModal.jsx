import React from 'react';
import { X, Users } from 'lucide-react';

const EditPlaceModal = ({
    lugar,
    formData,
    ubicaciones,
    empresa,
    onSubmit,
    onClose,
    onInputChange
}) => {
    const handleLocalInputChange = (e) => {
        const { name, value } = e.target;
        onInputChange(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    const inputCls = 'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition';
    const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

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
                    <h2 className="text-base font-semibold text-slate-800">Editar Lugar</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div>
                        <label className={labelCls}>Empresa</label>
                        <div className="h-9 flex items-center px-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700">
                            {empresa?.nombre || 'Cargando...'}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">La empresa no se puede modificar al editar un lugar</p>
                    </div>

                    <div>
                        <label htmlFor="edit_id_ubicacion" className={labelCls}>Ubicación *</label>
                        <select
                            id="edit_id_ubicacion" name="id_ubicacion"
                            value={formData.id_ubicacion} onChange={handleLocalInputChange}
                            required
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                        >
                            <option value="">Seleccione una ubicación</option>
                            {Array.isArray(ubicaciones) && ubicaciones.map((ubicacion) => (
                                <option key={ubicacion.id} value={ubicacion.id}>
                                    {ubicacion.lugar} - {ubicacion.direccion}{ubicacion.ciudad_nombre ? ` (${ubicacion.ciudad_nombre})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="edit_nombre" className={labelCls}>Nombre del Lugar *</label>
                        <input
                            type="text" id="edit_nombre" name="nombre"
                            value={formData.nombre} onChange={handleLocalInputChange}
                            placeholder="Nombre del lugar" required className={inputCls}
                        />
                    </div>

                    <div>
                        <label htmlFor="edit_capacidad" className={labelCls}>
                            <span className="inline-flex items-center gap-1"><Users size={12} /> Capacidad</span>
                        </label>
                        <input
                            type="number" id="edit_capacidad" name="capacidad"
                            value={formData.capacidad || ''} onChange={handleLocalInputChange}
                            placeholder="Ej: 50" min="1" className={inputCls}
                        />
                        <p className="text-xs text-slate-400 mt-1">Número máximo de personas (opcional)</p>
                    </div>

                    <div>
                        <label htmlFor="edit_descripcion" className={labelCls}>Descripción *</label>
                        <textarea
                            id="edit_descripcion" name="descripcion"
                            value={formData.descripcion} onChange={handleLocalInputChange}
                            placeholder="Descripción del lugar" rows="4" required
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >Cancelar</button>
                        <button
                            type="submit"
                            disabled={!formData.id_ubicacion || !formData.nombre || !formData.descripcion}
                            className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
                        >Actualizar Lugar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPlaceModal;
