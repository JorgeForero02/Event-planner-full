import React, { useState, useEffect } from 'react';
import Calendar from '../../../../assets/calendar.png';
import Location from '../../../../assets/lugar.png';
import ClockImg from '../../../../assets/clock.png';
import { CalendarDays, ClipboardCheck } from 'lucide-react';
import { formatFecha, formatHora } from '../../utils/dateUtils';
import agendaService from '../../../../services/agendaService';
import eventService from '../../../../services/eventService';
import { inscriptionService } from '../../../../services/inscriptionService';
import KpiCard from '../../../../components/ui/KpiCard';
import { Badge } from '../../../../components/ui/badge';

const Dashboard = () => {
    const [metricas, setMetricas] = useState({
        totalEventos: 0,
        eventosActivos: 0,
        totalInscripciones: 0,
        asistenciasRegistradas: 0,
        proximasActividades: 0,
        actividadesHoy: 0
    });
    const [misInscripciones, setMisInscripciones] = useState([]);
    const [proximasActividades, setProximasActividades] = useState([]);
    const [actividadesHoy, setActividadesHoy] = useState([]);
    const [eventosRecientes, setEventosRecientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [cargandoActividades, setCargandoActividades] = useState(false);

    const obtenerMetricas = async () => {
        setCargando(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token disponible');
            }

            const inscripciones = await inscriptionService.getMyInscriptions(token);
            setMisInscripciones(inscripciones);

            const eventosDisponibles = await eventService.getAvailableEvents(token);

            const actividadesProximas = await agendaService.obtenerActividadesPorFecha(
                inscripciones,
                token,
                'proximas'
            );

            const actividadesDelDia = await agendaService.obtenerActividadesPorFecha(
                inscripciones,
                token,
                'hoy'
            );

            setProximasActividades(actividadesProximas.slice(0, 5));
            setActividadesHoy(actividadesDelDia);

            const asistenciasTotales = inscripciones.reduce((total, inscripcion) => {
                return total + (inscripcion.asistencias?.length || 0);
            }, 0);

            setMetricas({
                totalEventos: eventosDisponibles.length,
                eventosActivos: eventosDisponibles.filter(evento =>
                    evento.estado_evento === 'Disponible' || evento.estado === 1
                ).length,
                totalInscripciones: inscripciones.length,
                asistenciasRegistradas: asistenciasTotales,
                proximasActividades: actividadesProximas.length,
                actividadesHoy: actividadesDelDia.length
            });

            setEventosRecientes(eventosDisponibles.slice(0, 3));

        } catch (error) {
        } finally {
            setCargando(false);
        }
    };

    // eslint-disable-next-line no-unused-vars
    const _obtenerActividadesProximas = async () => {
        if (misInscripciones.length === 0) return;

        setCargandoActividades(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            const actividades = await agendaService.obtenerActividadesPorFecha(
                misInscripciones,
                token,
                'proximas'
            );
            setProximasActividades(actividades.slice(0, 5));
        } catch (error) {
        } finally {
            setCargandoActividades(false);
        }
    };

    useEffect(() => {
        obtenerMetricas();
    }, []);

    const formatRangoHoras = (horaInicio, horaFin) => {
        const inicio = formatHora(horaInicio);
        const fin = formatHora(horaFin);
        return `${inicio} - ${fin}`;
    };

    const obtenerLugaresTexto = (lugares) => {
        if (!lugares || lugares.length === 0) return 'Virtual';
        return lugares.map(lugar => lugar.nombre).join(', ');
    };

    const getTextoEstado = (actividad) => {
        if (agendaService.estaEnCurso(actividad)) {
            return 'En curso';
        }
        if (agendaService.esProxima(actividad)) {
            return 'Próxima';
        }
        return 'Finalizada';
    };

    if (cargando) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="w-10 h-10 border-4 border-slate-200 border-l-brand-600 rounded-full animate-spin mb-4" />
                <p>Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">

            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800">Mi Dashboard</h1>
                <p className="text-slate-500 mt-1">Resumen de tus actividades y eventos</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KpiCard
                    icon={CalendarDays}
                    title="Eventos Disponibles"
                    value={metricas.totalEventos}
                    variant="brand"
                />
                <KpiCard
                    icon={ClipboardCheck}
                    title="Mis Inscripciones"
                    value={metricas.totalInscripciones}
                    variant="success"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center pb-4 mb-5 border-b border-slate-100">
                            <h2 className="text-base font-semibold text-slate-800">Próximas Actividades</h2>
                            <Badge variant="secondary">{proximasActividades.length}</Badge>
                        </div>

                        {cargandoActividades ? (
                            <div className="flex flex-col items-center py-10 text-slate-400">
                                <div className="w-8 h-8 border-4 border-slate-200 border-l-brand-600 rounded-full animate-spin mb-3" />
                                <p className="text-sm">Cargando actividades...</p>
                            </div>
                        ) : proximasActividades.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <p className="text-sm">No hay actividades próximas programadas</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {proximasActividades.map((actividad, index) => {
                                    const textoEstado = getTextoEstado(actividad);
                                    const lugaresTexto = obtenerLugaresTexto(actividad.lugares);
                                    const enCurso = agendaService.estaEnCurso(actividad);
                                    const proxima = agendaService.esProxima(actividad);

                                    return (
                                        <div key={`${actividad.id_actividad}-${index}`}
                                            className="border border-slate-100 rounded-lg p-4 bg-slate-50 hover:border-brand-200 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="text-sm font-semibold text-slate-800 flex-1 mr-3">{actividad.titulo}</h4>
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase whitespace-nowrap ${
                                                    enCurso  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                                    proxima  ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                                               'bg-slate-100 text-slate-500 border border-slate-200'
                                                }`}>
                                                    {textoEstado}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-1.5 mb-3">
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <img src={Calendar} alt="" className="w-3.5 h-3.5 opacity-60" />
                                                    <span>{formatFecha(actividad.fecha_actividad)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <img src={ClockImg} alt="" className="w-3.5 h-3.5 opacity-60" />
                                                    <span>{formatRangoHoras(actividad.hora_inicio, actividad.hora_fin)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <img src={Location} alt="" className="w-3.5 h-3.5 opacity-60" />
                                                    <span>{lugaresTexto}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                                <span className="text-xs text-brand-600 font-medium">{actividad.evento.titulo}</span>
                                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{actividad.evento.modalidad}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">

                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center pb-4 mb-5 border-b border-slate-100">
                            <h2 className="text-base font-semibold text-slate-800">Mis Inscripciones</h2>
                            <Badge variant="secondary">{misInscripciones.length}</Badge>
                        </div>

                        {misInscripciones.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-sm">No tienes inscripciones activas</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {misInscripciones.slice(0, 4).map((inscripcion) => (
                                    <div key={inscripcion.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-semibold text-slate-800 flex-1 mr-2 leading-tight">{inscripcion.evento.titulo}</h4>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase whitespace-nowrap ${
                                                inscripcion.estado === 'Confirmada'
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                                            }`}>
                                                {inscripcion.estado}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-slate-400">
                                            <span className="font-mono">Cód: {inscripcion.codigo}</span>
                                            <span>{formatFecha(inscripcion.fecha_inscripcion)}</span>
                                        </div>
                                        {inscripcion.asistencias && inscripcion.asistencias.length > 0 && (
                                            <div className="mt-1 text-xs text-brand-600 font-medium">
                                                Asistencias: {inscripcion.asistencias.length}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center pb-4 mb-5 border-b border-slate-100">
                            <h2 className="text-base font-semibold text-slate-800">Eventos Disponibles</h2>
                            <Badge variant="secondary">{eventosRecientes.length}</Badge>
                        </div>

                        {eventosRecientes.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-sm">No hay eventos disponibles</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {eventosRecientes.map((evento) => (
                                    <div key={evento.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <h4 className="text-sm font-semibold text-slate-800 flex-1 mr-2 leading-tight">{evento.titulo}</h4>
                                            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">{evento.modalidad}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-slate-400">
                                            <span>
                                                {formatFecha(evento.fecha_inicio)}
                                                {evento.fecha_fin && evento.fecha_fin !== evento.fecha_inicio &&
                                                    ` — ${formatFecha(evento.fecha_fin)}`
                                                }
                                            </span>
                                            {evento.cupos_disponibles > 0 && (
                                                <span className="text-emerald-600 font-medium">{evento.cupos_disponibles} cupos</span>
                                            )}
                                        </div>
                                        {evento.empresa && (
                                            <div className="mt-1 text-xs text-amber-600 font-medium italic">{evento.empresa}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                        <h2 className="text-base font-semibold text-slate-800 pb-4 mb-4 border-b border-slate-100">Resumen Rápido</h2>
                        <div className="flex flex-col divide-y divide-slate-100">
                            <div className="flex justify-between items-center py-3">
                                <span className="text-sm text-slate-500">Eventos Activos</span>
                                <span className="text-sm font-bold text-slate-800">{metricas.eventosActivos}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-sm text-slate-500">Actividades Próximas</span>
                                <span className="text-sm font-bold text-slate-800">{metricas.proximasActividades}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-sm text-slate-500">Asistencias Hoy</span>
                                <span className="text-sm font-bold text-slate-800">
                                    {actividadesHoy.filter(act => agendaService.estaEnCurso(act)).length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;