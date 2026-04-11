import React from 'react';
import { debugFecha } from '../../utils/dateUtils';

const EventModal = ({ evento, onClose, formatFecha, formatFechaCompleta }) => {
    const [ponentesPorActividad, setPonentePorActividad] = React.useState({});
    const [, setCargandoPonentes] = React.useState(false);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

    React.useEffect(() => {
        debugFecha(evento.fecha_inicio, 'Modal - Fecha inicio');
        debugFecha(evento.fecha_fin, 'Modal - Fecha fin');
    }, [evento]);

    React.useEffect(() => {
        const cargarPonentes = async () => {
            if (!evento.actividades || evento.actividades.length === 0) return;

            setCargandoPonentes(true);
            const token = localStorage.getItem('access_token');
            const ponentesData = {};

            try {
                for (const actividad of evento.actividades) {
                    const response = await fetch(
                        `${API_URL}/ponente-actividad/actividad/${actividad.id_actividad}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        ponentesData[actividad.id_actividad] = data.data?.filter(
                            pa => pa.estado === 'aceptado'
                        ) || [];
                    }
                }

                setPonentePorActividad(ponentesData);
            } catch (error) {
            } finally {
                setCargandoPonentes(false);
            }
        };

        cargarPonentes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [evento.actividades]);

    const formatearCupos = (valor) => {
        if (valor === undefined || valor === null) return 'No disponible';
        if (typeof valor === 'number') return valor.toString();
        return valor;
    };

    const obtenerActividadesOrdenadas = () => {
        if (!evento.actividades || evento.actividades.length === 0) return [];

        return [...evento.actividades].sort((a, b) => {
            const fechaHoraA = new Date(`${a.fecha_actividad}T${a.hora_inicio}`);
            const fechaHoraB = new Date(`${b.fecha_actividad}T${b.hora_inicio}`);
            return fechaHoraA - fechaHoraB;
        });
    };

    const formatearHora = (hora) => {
        if (!hora) return '';
        const [hours, minutes] = hora.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hora12 = h % 12 || 12;
        return `${hora12}:${minutes} ${ampm}`;
    };

    const actividadesOrdenadas = obtenerActividadesOrdenadas();

    const InfoItem = ({ label, children }) => (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
            <span className="text-sm text-slate-700">{children}</span>
        </div>
    );

    const Section = ({ title, children }) => (
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
            {children}
        </div>
    );

    return (
        <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Section title="Información General">
                    <InfoItem label="Título">{evento.titulo}</InfoItem>
                    <InfoItem label="Descripción">{evento.descripcion || 'No disponible'}</InfoItem>
                    <InfoItem label="Modalidad">{evento.modalidad || 'No especificado'}</InfoItem>
                    <InfoItem label="Estado">{evento.estado_evento === 'Disponible' ? 'Disponible' : 'No disponible'}</InfoItem>
                </Section>

                <Section title="Fechas">
                    <InfoItem label="Fecha de inicio">{formatFecha(evento.fecha_inicio)}</InfoItem>
                    <InfoItem label="Fecha de fin">{formatFecha(evento.fecha_fin)}</InfoItem>
                    {evento.hora && <InfoItem label="Hora">{evento.hora}</InfoItem>}
                </Section>

                <Section title="Capacidad y Organización">
                    <InfoItem label="Cupos totales">{formatearCupos(evento.cupo_total)}</InfoItem>
                    <InfoItem label="Gerente">{evento.organizador || evento.creador?.nombre || 'No especificado'}</InfoItem>
                    {evento.correo_organizador && <InfoItem label="Correo del gerente">{evento.correo_organizador}</InfoItem>}
                    <InfoItem label="Empresa">{evento.empresa || 'No especificada'}</InfoItem>
                </Section>

                <Section title="Información Adicional">
                    <InfoItem label="Fecha de creación">{formatFechaCompleta(evento.fecha_creacion)}</InfoItem>
                    <InfoItem label="Última actualización">{formatFechaCompleta(evento.fecha_actualizacion)}</InfoItem>
                    {actividadesOrdenadas.length > 0 && (
                        <InfoItem label="Total de actividades">{actividadesOrdenadas.length} actividad(es) programada(s)</InfoItem>
                    )}
                </Section>
            </div>

            {actividadesOrdenadas.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Cronograma de Actividades</h4>
                    <div className="space-y-3">
                        {actividadesOrdenadas.map((actividad, index) => {
                            const ponentes = ponentesPorActividad[actividad.id_actividad] || [];
                            return (
                                <div key={actividad.id_actividad}
                                    className={`border-l-2 border-brand-600 pl-3 py-2 bg-white rounded-r-lg ${index < actividadesOrdenadas.length - 1 ? 'mb-3' : ''}`}>
                                    <p className="text-sm font-semibold text-brand-700 mb-1">{index + 1}. {actividad.titulo}</p>
                                    <div className="grid gap-1 text-xs">
                                        <div className="flex gap-2">
                                            <span className="font-semibold text-slate-600 w-16 shrink-0">Fecha:</span>
                                            <span className="text-slate-500">{formatFecha(actividad.fecha_actividad)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-semibold text-slate-600 w-16 shrink-0">Horario:</span>
                                            <span className="text-slate-500">{formatearHora(actividad.hora_inicio)} - {formatearHora(actividad.hora_fin)}</span>
                                        </div>
                                        {actividad.lugares?.length > 0 && (
                                            <div className="flex gap-2">
                                                <span className="font-semibold text-slate-600 w-16 shrink-0">Lugar:</span>
                                                <span className="text-slate-500">{actividad.lugares.map(l => l.nombre).join(', ')}</span>
                                            </div>
                                        )}
                                        {ponentes.length > 0 && (
                                            <div className="flex gap-2">
                                                <span className="font-semibold text-slate-600 w-16 shrink-0">Ponente(s):</span>
                                                <span className="text-slate-500">{ponentes.map(pa => pa.ponente?.usuario?.nombre || 'N/D').join(', ')}</span>
                                            </div>
                                        )}
                                        {actividad.descripcion && (
                                            <div className="flex gap-2 mt-1">
                                                <span className="font-semibold text-slate-600 w-16 shrink-0">Descripción:</span>
                                                <span className="text-slate-500 leading-relaxed">{actividad.descripcion}</span>
                                            </div>
                                        )}
                                        {actividad.url && (
                                            <div className="flex gap-2">
                                                <span className="font-semibold text-slate-600 w-16 shrink-0">Enlace:</span>
                                                <a href={actividad.url} target="_blank" rel="noopener noreferrer"
                                                    className="text-brand-600 hover:underline break-all">{actividad.url}</a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-2">
                <button
                    onClick={onClose}
                    className="h-9 px-5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default EventModal;
