import React, { useState, useEffect } from 'react';

const InscriptionModal = ({ evento, onClose, onConfirm, formatFecha, loading = false, userData = null }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        institucion: ''
    });

    const getUserData = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return {
                    nombre: user.nombre || user.name || '',
                    email: user.email || user.correo || '',
                    telefono: user.telefono || user.phone || ''
                };
            }

            const token = localStorage.getItem('token') || localStorage.getItem('access_token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    return {
                        nombre: payload.nombre || payload.name || '',
                        email: payload.email || payload.correo || '',
                        telefono: payload.telefono || payload.phone || ''
                    };
                } catch (tokenError) {
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        const data = userData || getUserData();
        if (data) {
            setFormData(prevData => ({
                ...prevData,
                nombre: data.nombre || '',
                email: data.email || '',
                telefono: data.telefono || ''
            }));
        }
    }, [userData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const inputCls = "w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50";
    const labelCls = "text-xs font-semibold text-slate-600";

    return (
        <div className="space-y-4 py-2">
            {/* Event summary */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-800">{evento.titulo}</h3>
                <p className="text-xs text-slate-500"><span className="font-medium">Fecha:</span> {formatFecha(evento.fecha_inicio)}</p>
                <p className="text-xs text-slate-500"><span className="font-medium">Modalidad:</span> {evento.modalidad || 'Presencial'}</p>
                <p className="text-xs text-slate-500"><span className="font-medium">Cupos disponibles:</span> {evento.cupos_disponibles} de {evento.cupo_total}</p>
                {evento.descripcion && evento.descripcion !== 'Sin descripción disponible' && (
                    <p className="text-xs text-slate-500 mt-1">{evento.descripcion}</p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                    <label htmlFor="nombre" className={labelCls}>Nombre completo *</label>
                    <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange}
                        className={inputCls} placeholder="Ingresa tu nombre completo" disabled={loading} required />
                </div>

                <div className="space-y-1">
                    <label htmlFor="email" className={labelCls}>Email *</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                        className={inputCls} placeholder="Ingresa tu email" disabled={loading} required />
                </div>

                <div className="space-y-1">
                    <label htmlFor="telefono" className={labelCls}>Teléfono</label>
                    <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange}
                        className={inputCls} placeholder="Ingresa tu teléfono" disabled={loading} />
                </div>

                <div className="space-y-1">
                    <label htmlFor="institucion" className={labelCls}>Institución/Organización</label>
                    <input type="text" id="institucion" name="institucion" value={formData.institucion} onChange={handleChange}
                        className={inputCls} placeholder="Ingresa tu institución u organización" disabled={loading} />
                    <p className="text-xs text-slate-400">Campo opcional pero recomendado para eventos institucionales</p>
                </div>

                <div className="flex gap-2 pt-1">
                    <button type="button" onClick={onClose} disabled={loading}
                        className="flex-1 h-9 rounded-lg text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-60">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading || !formData.nombre || !formData.email}
                        className="flex-1 h-9 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-60">
                        {loading ? 'Inscribiendo...' : 'Confirmar Inscripción'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InscriptionModal;