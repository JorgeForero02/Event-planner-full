import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Building2, ExternalLink, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { formatFecha, formatHora } from '../../utils/dateUtils';
import agendaService from '../../../../services/agendaService';

const MODALIDAD_CLASSES = {
    virtual: 'bg-sky-50 text-sky-700',
    presencial: 'bg-violet-50 text-violet-700',
    híbrida: 'bg-teal-50 text-teal-700',
};

const Agenda = ({ misInscripciones, onRegisterAttendance }) => {
    const [actividades, setActividades] = useState([]);
    const [actividadesFiltradas, setActividadesFiltradas] = useState([]);
    const [eventosInscritos, setEventosInscritos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [cargandoEventos, setCargandoEventos] = useState(false);
    const [filtro, setFiltro] = useState('proximas');
    const [filtroEvento, setFiltroEvento] = useState('todos');
    const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
    const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
    const [detallesCompletos, setDetallesCompletos] = useState(null);
    const [cargandoDetalles, setCargandoDetalles] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

    const obtenerEventosInscritos = async () => {
        setCargandoEventos(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token disponible');
            }

            const response = await fetch(`${API_URL}/asistencias/mis-asistencias`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                const eventosMap = new Map();
                result.data.forEach(item => {
                    if (item.evento && !eventosMap.has(item.evento.id)) {
                        eventosMap.set(item.evento.id, {
                            id: item.evento.id,
                            titulo: item.evento.titulo,
                            empresa: item.evento.empresa,
                            modalidad: item.evento.modalidad
                        });
                    }
                });

                setEventosInscritos(Array.from(eventosMap.values()));
            } else {
                setEventosInscritos([]);
            }
        } catch (error) {
            setEventosInscritos([]);
        } finally {
            setCargandoEventos(false);
        }
    };

    const obtenerActividadesAgenda = async () => {
        if (misInscripciones.length === 0) {
            setActividades([]);
            setActividadesFiltradas([]);
            return;
        }

        setCargando(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token disponible');
            }

            const actividadesData = await agendaService.obtenerActividadesPorFecha(
                misInscripciones,
                token,
                filtro
            );

            setActividades(actividadesData);
            aplicarFiltros(actividadesData, filtroEvento);
        } catch (error) {
            setActividades([]);
            setActividadesFiltradas([]);
        } finally {
            setCargando(false);
        }
    };

    const aplicarFiltros = (actividadesData, eventoFiltro) => {
        let actividadesFiltradas = actividadesData;

        if (eventoFiltro !== 'todos') {
            actividadesFiltradas = actividadesFiltradas.filter(
                actividad => actividad.evento?.id?.toString() === eventoFiltro
            );
        }

        setActividadesFiltradas(actividadesFiltradas);
    };

    useEffect(() => {
        if (actividades.length > 0) {
            aplicarFiltros(actividades, filtroEvento);
        }
    }, [filtroEvento, actividades]);

    useEffect(() => {
        obtenerEventosInscritos();
        obtenerActividadesAgenda();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [misInscripciones, filtro]);
    const handleFiltroEventoChange = (event) => {
        setFiltroEvento(event.target.value);
    };

    const limpiarFiltroEvento = () => {
        setFiltroEvento('todos');
    };

    const cargarDetallesCompletos = async (actividad) => {
        setCargandoDetalles(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token disponible');
            }

            const [detallesActividad, ponentesResponse, detallesEvento] = await Promise.all([
                fetch(`${API_URL}/actividades/${actividad.id_actividad}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(r => r.json()),

                fetch(`${API_URL}/ponente-actividad/actividad/${actividad.id_actividad}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(r => r.json()),

                fetch(`${API_URL}/eventos/${actividad.evento?.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(r => r.json())
            ]);

            let ponentesProcesados = [];
            if (ponentesResponse.success && ponentesResponse.data && Array.isArray(ponentesResponse.data)) {
                ponentesProcesados = ponentesResponse.data.map((item) => {
                    try {
                        let nombre = 'Ponente por confirmar';
                        let especialidad = '';
                        let descripcion = '';
                        let correo = '';

                        if (item.ponente && item.ponente.usuario) {
                            nombre = item.ponente.usuario.nombre || nombre;
                            correo = item.ponente.usuario.correo || correo;
                            especialidad = item.ponente.especialidad || especialidad;
                            descripcion = item.ponente.descripcion || descripcion;
                        }
                        else if (item.usuario) {
                            nombre = item.usuario.nombre || nombre;
                            correo = item.usuario.correo || correo;
                            especialidad = item.especialidad || especialidad;
                            descripcion = item.descripcion || descripcion;
                        }
                        else {
                            nombre = item.nombre || nombre;
                            correo = item.correo || correo;
                            especialidad = item.especialidad || especialidad;
                            descripcion = item.descripcion || descripcion;
                        }

                        return {
                            nombre,
                            especialidad,
                            descripcion,
                            correo
                        };
                    } catch (error) {
                        return {
                            nombre: 'Ponente por confirmar',
                            especialidad: '',
                            descripcion: '',
                            correo: ''
                        };
                    }
                });
            }

            setDetallesCompletos({
                actividad: detallesActividad.success ? detallesActividad.data : null,
                ponentes: ponentesProcesados,
                evento: detallesEvento.success ? detallesEvento.data : null
            });

        } catch (error) {
            setDetallesCompletos({
                actividad: null,
                ponentes: [],
                evento: null
            });
        } finally {
            setCargandoDetalles(false);
        }
    };

    const abrirModalDetalles = async (actividad) => {
        setActividadSeleccionada(actividad);
        setModalDetallesAbierto(true);
        await cargarDetallesCompletos(actividad);
    };

    const cerrarModalDetalles = () => {
        setModalDetallesAbierto(false);
        setActividadSeleccionada(null);
        setDetallesCompletos(null);
    };

    const formatRangoHoras = (horaInicio, horaFin) => {
        const inicio = formatHora(horaInicio);
        const fin = formatHora(horaFin);
        return `${inicio} - ${fin}`;
    };

    const obtenerLugaresTexto = (lugares) => {
        if (!lugares || lugares.length === 0) return 'Virtual';
        return lugares.map(lugar => lugar.nombre).join(', ');
    };

    const getEstadoClasses = (actividad) => {
        if (agendaService.estaEnCurso(actividad)) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        if (agendaService.esProxima(actividad)) return 'bg-amber-50 text-amber-700 border border-amber-200';
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    };

    const getTextoEstado = (actividad) => {
        if (agendaService.estaEnCurso(actividad)) return 'En curso';
        if (agendaService.esProxima(actividad)) return 'Próxima';
        return 'Finalizada';
    };

    if (misInscripciones.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Mi Agenda</h1>
                    <p className="text-sm text-slate-500 mt-1">Consulta las actividades de tus eventos inscritos</p>
                </div>
                <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-xl border border-slate-200">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                        <Calendar size={24} className="text-slate-400" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-slate-700">No tienes eventos en tu agenda</h3>
                        <p className="text-sm text-slate-500 mt-1">Inscríbete en eventos para ver las actividades programadas</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Mi Agenda</h1>
                <p className="text-sm text-slate-500 mt-1">Consulta las actividades de tus eventos inscritos</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'proximas', label: 'Próximas' },
                        { key: 'semana', label: 'Esta semana' },
                        { key: 'mes', label: 'Este mes' },
                        { key: 'todas', label: 'Todas' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFiltro(key)}
                            className={`h-9 px-4 rounded-lg text-xs font-semibold transition-colors ${
                                filtro === key
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label htmlFor="filtroEvento" className="text-xs font-medium text-slate-600 whitespace-nowrap">
                            Filtrar por evento:
                        </label>
                        <div className="relative">
                            <select
                                id="filtroEvento"
                                value={filtroEvento}
                                onChange={handleFiltroEventoChange}
                                disabled={cargandoEventos}
                                className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20 disabled:opacity-50"
                            >
                                <option value="todos">Todos los eventos</option>
                                {eventosInscritos.map(evento => (
                                    <option key={evento.id} value={evento.id}>
                                        {evento.titulo}
                                    </option>
                                ))}
                            </select>
                            {filtroEvento !== 'todos' && (
                                <button
                                    onClick={limpiarFiltroEvento}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    title="Limpiar filtro"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    <span className="text-xs text-slate-500 whitespace-nowrap">
                        {actividadesFiltradas.length} actividad(es)
                        {filtroEvento !== 'todos' && actividades.length > 0 && (
                            <span className="ml-1 text-slate-400">de {actividades.length} totales</span>
                        )}
                    </span>
                </div>
            </div>

            {cargando ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">Cargando actividades...</p>
                </div>
            ) : actividadesFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-xl border border-slate-200">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                        <Calendar size={24} className="text-slate-400" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-base font-semibold text-slate-700">
                            No hay actividades {filtro !== 'todas' ? `para ${filtro}` : 'disponibles'}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {filtroEvento !== 'todos'
                                ? 'No se encontraron actividades para el evento seleccionado'
                                : 'No se encontraron actividades con los filtros aplicados'}
                        </p>
                        {filtroEvento !== 'todos' && (
                            <button
                                onClick={limpiarFiltroEvento}
                                className="mt-3 h-9 px-4 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                            >
                                Ver todos los eventos
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {actividadesFiltradas.map((actividad, index) => {
                        const estadoClases = getEstadoClasses(actividad);
                        const textoEstado = getTextoEstado(actividad);
                        const lugaresTexto = obtenerLugaresTexto(actividad.lugares);
                        const modalidadKey = actividad.evento?.modalidad?.toLowerCase();
                        const modalidadCls = MODALIDAD_CLASSES[modalidadKey] || 'bg-slate-100 text-slate-600';

                        return (
                            <div key={`${actividad.id_actividad}-${index}`}
                                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">

                                <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                                    <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 flex-1">
                                        {actividad.titulo}
                                    </h3>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        {actividad.evento?.modalidad && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${modalidadCls}`}>
                                                {actividad.evento.modalidad}
                                            </span>
                                        )}
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${estadoClases}`}>
                                            {textoEstado}
                                        </span>
                                    </div>
                                </div>

                                <div className="px-5 pb-3 space-y-2 flex-1">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar size={12} className="text-slate-400 shrink-0" />
                                        <span>{formatFecha(actividad.fecha_actividad)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Clock size={12} className="text-slate-400 shrink-0" />
                                        <span>{formatRangoHoras(actividad.hora_inicio, actividad.hora_fin)}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs text-slate-500">
                                        <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                                        <span>{lugaresTexto}</span>
                                    </div>
                                    {actividad.evento?.empresa && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Building2 size={12} className="text-slate-400 shrink-0" />
                                            <span>{actividad.evento.empresa}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="px-5 pb-4 pt-1">
                                    <button
                                        onClick={() => abrirModalDetalles(actividad)}
                                        className="w-full h-9 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                                    >
                                        Ver detalles completos
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Dialog
                open={modalDetallesAbierto && !!actividadSeleccionada}
                onOpenChange={(open) => !open && cerrarModalDetalles()}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalles de la Actividad</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                        {!actividadSeleccionada ? null : cargandoDetalles ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-slate-500">Cargando información detallada...</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <section>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">Información General</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { label: 'Empresa', value: detallesCompletos?.evento?.empresa?.nombre || detallesCompletos?.evento?.empresa || actividadSeleccionada.evento?.empresa || 'No especificada' },
                                            { label: 'Evento', value: actividadSeleccionada.evento?.titulo || 'Sin título' },
                                            { label: 'Actividad', value: actividadSeleccionada.titulo },
                                            { label: 'Modalidad', value: detallesCompletos?.actividad?.evento?.modalidad || actividadSeleccionada.evento?.modalidad || 'No especificada' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-slate-50 rounded-lg p-3">
                                                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                                                <p className="text-sm font-medium text-slate-800">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {actividadSeleccionada.descripcion && (
                                    <section>
                                        <h3 className="text-sm font-semibold text-slate-700 mb-2 pb-2 border-b border-slate-100">Descripción</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">{actividadSeleccionada.descripcion}</p>
                                    </section>
                                )}

                                <section>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">Lugares</h3>
                                    {actividadSeleccionada.lugares && actividadSeleccionada.lugares.length > 0 ? (
                                        <div className="space-y-2">
                                            {actividadSeleccionada.lugares.map((lugar, index) => (
                                                <div key={lugar.id || index} className="bg-slate-50 rounded-lg p-3">
                                                    <p className="text-sm font-semibold text-slate-800">{lugar.nombre}</p>
                                                    {lugar.descripcion && <p className="text-xs text-slate-500 mt-0.5">{lugar.descripcion}</p>}
                                                    <div className="flex gap-4 mt-1">
                                                        {lugar.capacidad && <span className="text-xs text-slate-600"><strong>Capacidad:</strong> {lugar.capacidad}</span>}
                                                        {lugar.equipamiento && <span className="text-xs text-slate-600"><strong>Equipamiento:</strong> {lugar.equipamiento}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">Actividad virtual - Sin lugar físico asignado</p>
                                    )}
                                </section>

                                <section>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">Organizador</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-500 mb-0.5">Nombre</p>
                                            <p className="text-sm font-medium text-slate-800">{detallesCompletos?.evento?.creador?.nombre || 'No especificado'}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-500 mb-0.5">Email</p>
                                            <p className="text-sm font-medium text-slate-800">{detallesCompletos?.evento?.creador?.correo || 'No especificado'}</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">Ponentes</h3>
                                    {detallesCompletos?.ponentes && detallesCompletos.ponentes.length > 0 ? (
                                        <div className="space-y-2">
                                            {detallesCompletos.ponentes.map((ponente, index) => (
                                                <div key={index} className="bg-slate-50 rounded-lg p-3">
                                                    <p className="text-sm font-semibold text-slate-800">{ponente.nombre}</p>
                                                    {ponente.especialidad && <p className="text-xs text-slate-500 mt-0.5">{ponente.especialidad}</p>}
                                                    {ponente.correo && <p className="text-xs text-slate-400 mt-0.5">{ponente.correo}</p>}
                                                    {ponente.descripcion && <p className="text-xs text-slate-600 mt-1">{ponente.descripcion}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">No hay ponentes asignados para esta actividad</p>
                                    )}
                                </section>

                                <section>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">Horario</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-500 mb-0.5">Fecha</p>
                                            <p className="text-sm font-medium text-slate-800">{formatFecha(actividadSeleccionada.fecha_actividad)}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-500 mb-0.5">Horario</p>
                                            <p className="text-sm font-medium text-slate-800">{formatRangoHoras(actividadSeleccionada.hora_inicio, actividadSeleccionada.hora_fin)}</p>
                                        </div>
                                    </div>
                                </section>

                                {actividadSeleccionada.url && (
                                    <section>
                                        <h3 className="text-sm font-semibold text-slate-700 mb-2 pb-2 border-b border-slate-100">Enlace de la Actividad</h3>
                                        <a
                                            href={actividadSeleccionada.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
                                        >
                                            <ExternalLink size={14} />
                                            Acceder a la actividad
                                        </a>
                                    </section>
                                )}
                            </div>
                        )}
                    </div>

                        <DialogFooter>
                            <button
                                onClick={cerrarModalDetalles}
                                className="h-9 px-5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                Cerrar
                            </button>
                        </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Agenda;