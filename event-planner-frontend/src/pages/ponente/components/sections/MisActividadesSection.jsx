import { useState, useEffect, useCallback } from 'react';
import ActividadCard from '../ui/ActividadCard';

const FILTERS = [
    { key: 'todas', label: 'Todas' },
    { key: 'pendientes', label: 'Pendientes' },
    { key: 'aceptadas', label: 'Aceptadas' },
    { key: 'solicitud_cambio', label: 'Con Solicitud' },
];

const MisActividadesSection = ({ actividades, onSolicitudEnviada, error }) => {
    const [filter, setFilter] = useState('todas');
    const [actividadesFiltradas, setActividadesFiltradas] = useState([]);
    const [actividadesData, setActividadesData] = useState(actividades || []);

    useEffect(() => {
        if (actividades && Array.isArray(actividades)) {
            setActividadesData(actividades);
        }
    }, [actividades]);

    const handleActualizarEstadoActividad = useCallback((idActividad, nuevoEstado, fechaRespuesta) => {
        setActividadesData(prev => {
            return prev.map(actividad => {
                if (actividad.id_actividad === idActividad ||
                    actividad.id_asignacion === idActividad ||
                    (actividad.actividad && actividad.actividad.id_actividad === idActividad)) {

                    return {
                        ...actividad,
                        estado: nuevoEstado,
                        fecha_respuesta: fechaRespuesta || new Date().toISOString()
                    };
                }
                return actividad;
            });
        });
    }, []);

    useEffect(() => {
        if (!actividadesData || !Array.isArray(actividadesData)) {
            setActividadesFiltradas([]);
            return;
        }

        const actividadesProcesadas = actividadesData.map(asignacion => {
            if (asignacion.nombre || asignacion.titulo) {
                return asignacion;
            }

            if (asignacion.actividad) {
                return {
                    id_asignacion: asignacion.id_asignacion,
                    id_ponente: asignacion.id_ponente,
                    id_actividad: asignacion.id_actividad,
                    estado: asignacion.estado,
                    fecha_asignacion: asignacion.fecha_asignacion,
                    fecha_respuesta: asignacion.fecha_respuesta,
                    notas: asignacion.notas,

                    nombre: asignacion.actividad.titulo || asignacion.actividad.nombre,
                    descripcion: asignacion.actividad.descripcion,
                    fecha: asignacion.actividad.fecha_actividad,
                    hora_inicio: asignacion.actividad.hora_inicio,
                    hora_fin: asignacion.actividad.hora_fin,
                    ubicacion: asignacion.actividad.ubicacion,
                    tipo: asignacion.actividad.tipo,

                    evento: asignacion.evento
                };
            }

            return asignacion;
        });

        const filtradas = actividadesProcesadas.filter(actividad => {
            if (!actividad.estado) {
                return filter === 'todas';
            }

            if (filter === 'pendientes') return actividad.estado === 'pendiente';
            if (filter === 'aceptadas') return actividad.estado === 'aceptado';
            if (filter === 'solicitud_cambio') return actividad.estado === 'solicitud_cambio';
            return true;
        });

        setActividadesFiltradas(filtradas);
    }, [actividadesData, filter]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-slate-800">Mis Actividades</h2>
                <p className="text-sm text-slate-500">Gestiona tus actividades asignadas</p>
            </div>

            {error && (
                <div className="rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
                    <strong>Atención:</strong> {error}. Si crees que deberías tener actividades, contacta al organizador o administrador para que te vinculen como ponente.
                </div>
            )}

            {/* Filters + counter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={
                                filter === key
                                    ? 'px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white'
                                    : 'px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors'
                            }
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <span className="text-sm text-slate-500 shrink-0">
                    <span className="font-semibold text-slate-700">{actividadesFiltradas.length}</span>{' '}
                    {actividadesFiltradas.length === 1 ? 'actividad' : 'actividades'}
                </span>
            </div>

            {/* Grid */}
            {actividadesFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-slate-500 text-sm">
                        No tienes actividades{filter !== 'todas' ? ` ${filter}` : ''}.
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                        {actividades?.length === 0
                            ? 'Cuando un organizador te asigne actividades, aparecerán aquí.'
                            : 'Prueba con otro filtro para ver más actividades.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {actividadesFiltradas.map((actividad, index) => (
                        <ActividadCard
                            key={actividad.id_asignacion || `${actividad.id_ponente}-${actividad.id_actividad}-${index}`}
                            actividad={actividad}
                            showActions={true}
                            onSolicitudEnviada={onSolicitudEnviada}
                            onActualizarEstado={handleActualizarEstadoActividad}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MisActividadesSection;