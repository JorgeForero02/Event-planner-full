import React, { useState, useEffect } from 'react';
import { useEncuestas } from '../../hooks/useEncuestas';
import EncuestaCard from './EncuestaCard';
import EncuestaModal from './EncuestaModal';

const Encuestas = ({ actividadesDisponibles = [], cargandoActividades = false }) => {
    const {
        loading,
        error,
        completando,
        obtenerEncuestas,
        marcarComoCompletada,
        filtrarPorTipo,
        obtenerEstadoEncuesta
    } = useEncuestas();

    const [eventosUnicos, setEventosUnicos] = useState([]);
    const [eventoSeleccionado, setEventoSeleccionado] = useState('');
    const [actividadesFiltradas, setActividadesFiltradas] = useState([]);
    const [actividadSeleccionada, setActividadSeleccionada] = useState('');
    const [actividadNombre, setActividadNombre] = useState('');
    const [eventoNombre, setEventoNombre] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [encuestaSeleccionada, setEncuestaSeleccionada] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [confirmandoCompletar, setConfirmandoCompletar] = useState(false);
    const [mostrarAlerta, setMostrarAlerta] = useState(false);
    const [mensajeAlerta, setMensajeAlerta] = useState('');
    const [tipoAlerta, setTipoAlerta] = useState('success');
    const [idAsistente, setIdAsistente] = useState(null);

    const obtenerIdAsistente = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                return null;
            }

            const user = JSON.parse(userStr);

            const posiblesPropiedades = [
                'id_asistente',
                'asistente_id',
                'idAsistente',
                'rolData.id_asistente'
            ];

            for (const prop of posiblesPropiedades) {
                if (prop.includes('.')) {
                    const parts = prop.split('.');
                    let value = user;
                    for (const part of parts) {
                        if (value && typeof value === 'object') {
                            value = value[part];
                        } else {
                            value = null;
                            break;
                        }
                    }

                    if (value) {
                        return value;
                    }
                } else {
                    if (user[prop]) {
                        return user[prop];
                    }
                }
            }

            if (user.rolData) {

                if (user.rolData.id_asistente) {
                    return user.rolData.id_asistente;
                }

                if (user.rolData.asistente_id) {
                    return user.rolData.asistente_id;
                }
            }

            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));

                    if (payload.rolData?.id_asistente) {
                        return payload.rolData.id_asistente;
                    }

                    if (payload.id_asistente) {
                        return payload.id_asistente;
                    }
                } catch (error) {
                }
            }

            if (user.rolData) {
            }

            return null;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        const asistenteId = obtenerIdAsistente();
        setIdAsistente(asistenteId);

        if (!asistenteId) {
            mostrarAlertaError('No se pudo identificar tu cuenta. Por favor, cierra sesiÃ³n y vuelve a iniciar.');
        }
    }, []);

    useEffect(() => {
        if (actividadesDisponibles.length > 0) {
            const eventosMap = new Map();

            actividadesDisponibles.forEach(actividad => {
                if (!eventosMap.has(actividad.id_evento)) {
                    eventosMap.set(actividad.id_evento, {
                        id: actividad.id_evento,
                        titulo: actividad.evento_titulo,
                        fecha_inicio: actividad.evento_fecha_inicio
                    });
                }
            });

            setEventosUnicos(Array.from(eventosMap.values()));

            if (eventosMap.size > 0 && !eventoSeleccionado) {
                const primerEvento = Array.from(eventosMap.values())[0];
                setEventoSeleccionado(primerEvento.id.toString());
                setEventoNombre(primerEvento.titulo);
            }
        } else {
            setEventosUnicos([]);
            setEventoSeleccionado('');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actividadesDisponibles]);

    useEffect(() => {
        if (eventoSeleccionado && actividadesDisponibles.length > 0) {
            const actividadesDelEvento = actividadesDisponibles.filter(
                actividad => actividad.id_evento.toString() === eventoSeleccionado.toString()
            );

            setActividadesFiltradas(actividadesDelEvento);

            const evento = eventosUnicos.find(e => e.id.toString() === eventoSeleccionado.toString());
            if (evento) {
                setEventoNombre(evento.titulo);
            }

            if (actividadesDelEvento.length > 0 && !actividadSeleccionada) {
                const primeraActividadId = actividadesDelEvento[0].id_actividad.toString();
                setActividadSeleccionada(primeraActividadId);
            } else if (actividadesDelEvento.length === 0) {
                setActividadSeleccionada('');
            }
        } else {
            setActividadesFiltradas([]);
            setActividadSeleccionada('');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventoSeleccionado, actividadesDisponibles]);

    useEffect(() => {
        if (eventoSeleccionado) {
            cargarEncuestas();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventoSeleccionado, actividadSeleccionada, filtroTipo]);

    const cargarEncuestas = async () => {
        if (!eventoSeleccionado) return;

        try {
            const opcionesBusqueda = {
                eventoId: eventoSeleccionado,
                tipoEncuesta: filtroTipo || null
            };

            if (filtroTipo !== 'satisfaccion_evento' && actividadSeleccionada) {
                opcionesBusqueda.actividadId = actividadSeleccionada;
            }

            await obtenerEncuestas(opcionesBusqueda);

            const evento = eventosUnicos.find(e => e.id.toString() === eventoSeleccionado.toString());
            if (evento) {
                setEventoNombre(evento.titulo);
            }

            if (actividadSeleccionada && filtroTipo !== 'satisfaccion_evento') {
                const actividad = actividadesFiltradas.find(
                    a => a.id_actividad.toString() === actividadSeleccionada.toString()
                );
                if (actividad) {
                    setActividadNombre(actividad.titulo);
                }
            }
        } catch (error) {
            mostrarAlertaError(error.message || 'Error al cargar encuestas');
        }
    };

    const encuestasFiltradas = filtrarPorTipo(filtroTipo);

    const tiposEncuesta = [
        { value: '', label: 'Todos los tipos' },
        { value: 'pre_actividad', label: 'Pre Actividad' },
        { value: 'durante_actividad', label: 'Durante Actividad' },
        { value: 'post_actividad', label: 'Post Actividad' },
        { value: 'satisfaccion_evento', label: 'SatisfacciÃ³n Evento' }
    ];

    const handleAccederEncuesta = (encuesta) => {
        setEncuestaSeleccionada(encuesta);
        setModalAbierto(true);
    };

    const handleCompletarEncuesta = async (encuesta) => {
        setConfirmandoCompletar(true);
    };

    const confirmarCompletar = async () => {
        try {
            if (!idAsistente) {
                throw new Error('No se pudo identificar tu cuenta. Por favor, recarga la pÃ¡gina.');
            }

            await marcarComoCompletada(encuestaSeleccionada.id);
            mostrarAlertaExito('Encuesta completada exitosamente');
            setModalAbierto(false);
            setConfirmandoCompletar(false);
            cargarEncuestas();
        } catch (error) {
            mostrarAlertaError(error.message || 'Error al completar la encuesta');
        }
    };

    const mostrarAlertaExito = (mensaje) => {
        setMensajeAlerta(mensaje);
        setTipoAlerta('success');
        setMostrarAlerta(true);
        setTimeout(() => setMostrarAlerta(false), 3000);
    };

    const mostrarAlertaError = (mensaje) => {
        setMensajeAlerta(mensaje);
        setTipoAlerta('error');
        setMostrarAlerta(true);
        setTimeout(() => setMostrarAlerta(false), 5000);
    };

    const cerrarAlerta = () => {
        setMostrarAlerta(false);
    };

    const resetearFiltros = () => {
        setEventoSeleccionado('');
        setActividadSeleccionada('');
        setFiltroTipo('');
        setActividadNombre('');
        setEventoNombre('');
    };

    const getColorPorTipo = (tipo) => {
        switch (tipo) {
            case 'pre_actividad': return '#3B82F6';
            case 'durante_actividad': return '#F59E0B';
            case 'post_actividad': return '#10B981';
            case 'satisfaccion_evento': return '#8B5CF6';
            default: return '#6B7280';
        }
    };

    const getTextoPorTipo = (tipo) => {
        switch (tipo) {
            case 'pre_actividad': return 'Pre Actividad';
            case 'durante_actividad': return 'Durante Actividad';
            case 'post_actividad': return 'Post Actividad';
            case 'satisfaccion_evento': return 'SatisfacciÃ³n Evento';
            default: return tipo;
        }
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getTituloSeccion = () => {
        if (filtroTipo === 'satisfaccion_evento') {
            return `Encuestas de SatisfacciÃ³n del Evento: ${eventoNombre}`;
        } else if (actividadSeleccionada && actividadNombre) {
            return `Encuestas de la Actividad: ${actividadNombre}`;
        } else if (eventoNombre) {
            return `Encuestas del Evento: ${eventoNombre}`;
        }
        return 'Encuestas';
    };

    if (actividadesDisponibles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <h3 className="text-slate-700 font-semibold">No hay actividades disponibles</h3>
                <p className="text-sm text-slate-400 mt-1">No estÃ¡s inscrito en ningÃºn evento o los eventos no tienen actividades asignadas.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Alert */}
            {mostrarAlerta && (
                <div className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm ${tipoAlerta === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'}`}>
                    <span>{mensajeAlerta}</span>
                    <button onClick={cerrarAlerta} className="ml-3 text-lg leading-none opacity-60 hover:opacity-100">Ã—</button>
                </div>
            )}

            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-slate-800">Encuestas</h2>
                <p className="text-sm text-slate-500">Selecciona un evento y una actividad para ver las encuestas disponibles</p>
            </div>

            {/* Cascade filters */}
            <div className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1 min-w-[180px]">
                    <label className="text-xs font-semibold text-slate-500">Evento:</label>
                    <select
                        value={eventoSeleccionado}
                        onChange={(e) => {
                            setEventoSeleccionado(e.target.value);
                            setActividadSeleccionada('');
                            setFiltroTipo('');
                        }}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                        <option value="">Seleccionar evento</option>
                        {eventosUnicos.map(evento => (
                            <option key={evento.id} value={evento.id}>
                                {evento.titulo} - {formatFecha(evento.fecha_inicio)}
                            </option>
                        ))}
                    </select>
                </div>

                {eventoSeleccionado && filtroTipo !== 'satisfaccion_evento' && (
                    <div className="flex flex-col gap-1 min-w-[180px]">
                        <label className="text-xs font-semibold text-slate-500">Actividad:</label>
                        <select
                            value={actividadSeleccionada}
                            onChange={(e) => {
                                setActividadSeleccionada(e.target.value);
                                if (filtroTipo === 'satisfaccion_evento') setFiltroTipo('');
                            }}
                            disabled={actividadesFiltradas.length === 0}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                        >
                            <option value="">Seleccionar actividad</option>
                            {actividadesFiltradas.map(actividad => (
                                <option key={actividad.id_actividad} value={actividad.id_actividad}>
                                    {actividad.titulo} - {formatFecha(actividad.fecha_actividad || actividad.evento_fecha_inicio)}
                                </option>
                            ))}
                        </select>
                        {actividadesFiltradas.length === 0 && (
                            <p className="text-xs text-slate-400">Este evento no tiene actividades</p>
                        )}
                    </div>
                )}

                {eventoSeleccionado && (
                    <div className="flex flex-col gap-1 min-w-[180px]">
                        <label className="text-xs font-semibold text-slate-500">Tipo de encuesta:</label>
                        <select
                            value={filtroTipo}
                            onChange={(e) => {
                                const nuevoTipo = e.target.value;
                                setFiltroTipo(nuevoTipo);
                                if (nuevoTipo === 'satisfaccion_evento') setActividadSeleccionada('');
                            }}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            {tiposEncuesta.map(tipo => (
                                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                {(eventoSeleccionado || actividadSeleccionada || filtroTipo) && (
                    <button
                        onClick={resetearFiltros}
                        className="h-9 px-4 rounded-lg text-xs font-semibold bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>

            {(eventoSeleccionado || actividadSeleccionada) && (
                <h3 className="text-sm font-semibold text-slate-700">{getTituloSeccion()}</h3>
            )}

            {!eventoSeleccionado ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <h3 className="text-slate-600 font-semibold">Selecciona un evento</h3>
                    <p className="text-sm text-slate-400 mt-1">Elige un evento para ver las encuestas disponibles</p>
                </div>
            ) : loading ? (
                <div className="flex items-center gap-3 py-8 justify-center text-slate-500 text-sm">
                    <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                    Cargando encuestas...
                </div>
            ) : error ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <p className="text-sm text-danger">{error}</p>
                    <button onClick={cargarEncuestas} className="h-8 px-4 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors">
                        Reintentar
                    </button>
                </div>
            ) : encuestasFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <h3 className="text-slate-600 font-semibold">No hay encuestas disponibles</h3>
                    <p className="text-sm text-slate-400 mt-1">
                        {filtroTipo
                            ? `No hay encuestas del tipo "${getTextoPorTipo(filtroTipo)}" para esta ${filtroTipo === 'satisfaccion_evento' ? 'evento' : 'actividad'}.`
                            : 'No hay encuestas asignadas.'}
                    </p>
                </div>
            ) : (
                <>
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Total', value: encuestasFiltradas.length },
                            { label: 'Completadas', value: encuestasFiltradas.filter(e => obtenerEstadoEncuesta(e).estado === 'completada').length },
                            { label: 'Pendientes', value: encuestasFiltradas.filter(e => obtenerEstadoEncuesta(e).estado === 'pendiente').length },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                                <p className="text-2xl font-bold text-slate-800">{value}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {encuestasFiltradas.map((encuesta) => (
                            <EncuestaCard
                                key={encuesta.id}
                                encuesta={encuesta}
                                color={getColorPorTipo(encuesta.tipo_encuesta)}
                                tipoTexto={getTextoPorTipo(encuesta.tipo_encuesta)}
                                estado={obtenerEstadoEncuesta(encuesta)}
                                onAcceder={() => handleAccederEncuesta(encuesta)}
                                onCompletar={() => handleCompletarEncuesta(encuesta)}
                                loading={completando}
                                esEncuestaEvento={encuesta.tipo_encuesta === 'satisfaccion_evento'}
                                eventoNombre={eventoNombre}
                                idAsistente={idAsistente}
                            />
                        ))}
                    </div>
                </>
            )}

            {modalAbierto && encuestaSeleccionada && (
                <EncuestaModal
                    encuesta={encuestaSeleccionada}
                    tipoTexto={getTextoPorTipo(encuestaSeleccionada.tipo_encuesta)}
                    estado={obtenerEstadoEncuesta(encuestaSeleccionada)}
                    onClose={() => {
                        setModalAbierto(false);
                        setConfirmandoCompletar(false);
                    }}
                    onCompletar={confirmarCompletar}
                    confirmandoCompletar={confirmandoCompletar}
                    color={getColorPorTipo(encuestaSeleccionada.tipo_encuesta)}
                    esEncuestaEvento={encuestaSeleccionada.tipo_encuesta === 'satisfaccion_evento'}
                    eventoNombre={eventoNombre}
                    idAsistente={idAsistente}
                />
            )}
        </div>
    );
};


export default Encuestas;
