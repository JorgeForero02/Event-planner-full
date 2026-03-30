import React from 'react';
import { X } from 'lucide-react';

const EditLocationModal = ({
    ubicacion,
    formData,
    ciudades,
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
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-800">Editar Ubicación</h2>
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
                    </div>

                    <div>
                        <label htmlFor="edit_lugar" className={labelCls}>Lugar *</label>
                        <input
                            type="text" id="edit_lugar" name="lugar"
                            value={formData.lugar} onChange={handleLocalInputChange}
                            placeholder="Nombre del lugar" required className={inputCls}
                        />
                    </div>

                    <div>
                        <label htmlFor="edit_direccion" className={labelCls}>Dirección *</label>
                        <input
                            type="text" id="edit_direccion" name="direccion"
                            value={formData.direccion} onChange={handleLocalInputChange}
                            placeholder="Dirección completa" required className={inputCls}
                        />
                    </div>

                    <div>
                        <label htmlFor="edit_id_ciudad" className={labelCls}>Ciudad *</label>
                        <select
                            id="edit_id_ciudad" name="id_ciudad"
                            value={formData.id_ciudad} onChange={handleLocalInputChange}
                            required
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                        >
                            <option value="">Seleccione una ciudad</option>
                            {ciudades.map((ciudad) => (
                                <option key={ciudad.id} value={ciudad.id}>{ciudad.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="edit_descripcion" className={labelCls}>Descripción *</label>
                        <textarea
                            id="edit_descripcion" name="descripcion"
                            value={formData.descripcion} onChange={handleLocalInputChange}
                            placeholder="Descripción de la ubicación" rows="4" required
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >Cancelar</button>
                        <button type="submit"
                            className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
                        >Actualizar Ubicación</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLocationModal;