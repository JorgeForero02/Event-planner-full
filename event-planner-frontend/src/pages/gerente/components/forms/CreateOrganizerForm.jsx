import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const inputCls = (hasError) =>
  `h-9 w-full rounded-lg border ${hasError ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-brand-500'} bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition disabled:opacity-50`;

const CreateOrganizerForm = ({
    formData,
    errors,
    apiError,
    success,
    loading,
    onInputChange,
    onSubmit,
    onCancel
}) => {
    const handleLocalInputChange = (e) => {
        const { name, value } = e.target;
        onInputChange(name, value);
    };

    return (
        <div>
            {apiError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm mb-4">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{apiError}</span>
                </div>
            )}
            {success && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm mb-4">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    <span>{success}</span>
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label htmlFor="nombre" className="block text-xs font-medium text-slate-600 mb-1">Nombre Completo *</label>
                    <input type="text" id="nombre" name="nombre"
                        value={formData.nombre} onChange={handleLocalInputChange}
                        placeholder="Ej: Juan Pérez" disabled={loading}
                        className={inputCls(!!errors.nombre)} />
                    {errors.nombre && <p className="text-xs text-rose-600 mt-1">{errors.nombre}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="cedula" className="block text-xs font-medium text-slate-600 mb-1">Cédula *</label>
                        <input type="text" id="cedula" name="cedula"
                            value={formData.cedula} onChange={handleLocalInputChange}
                            placeholder="Ej: 1234567890" disabled={loading}
                            className={inputCls(!!errors.cedula)} />
                        {errors.cedula && <p className="text-xs text-rose-600 mt-1">{errors.cedula}</p>}
                    </div>
                    <div>
                        <label htmlFor="telefono" className="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
                        <input type="tel" id="telefono" name="telefono"
                            value={formData.telefono} onChange={handleLocalInputChange}
                            placeholder="Ej: 3001234567" disabled={loading}
                            className={inputCls(false)} />
                    </div>
                </div>

                <div>
                    <label htmlFor="correo" className="block text-xs font-medium text-slate-600 mb-1">Correo Electrónico *</label>
                    <input type="email" id="correo" name="correo"
                        value={formData.correo} onChange={handleLocalInputChange}
                        placeholder="ejemplo@correo.com" disabled={loading}
                        className={inputCls(!!errors.correo)} />
                    {errors.correo && <p className="text-xs text-rose-600 mt-1">{errors.correo}</p>}
                </div>

                <div>
                    <label htmlFor="contrasena" className="block text-xs font-medium text-slate-600 mb-1">Contraseña Temporal *</label>
                    <input type="password" id="contrasena" name="contraseña"
                        value={formData['contraseña']} onChange={handleLocalInputChange}
                        placeholder="Mínimo 6 caracteres" minLength={6} disabled={loading}
                        className={inputCls(!!errors['contraseña'])} />
                    {errors['contraseña'] && <p className="text-xs text-rose-600 mt-1">{errors['contraseña']}</p>}
                    <p className="text-xs text-slate-400 mt-1">Esta contraseña se enviará por correo al organizador</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={onCancel} disabled={loading}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >Cancelar</button>
                    <button type="submit" disabled={loading}
                        className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading
                            ? <><span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />Creando...</>
                            : 'Crear Organizador'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateOrganizerForm;
