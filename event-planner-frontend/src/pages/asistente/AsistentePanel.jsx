import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import Sidebar from '../../layouts/Sidebar/sidebarAsistente/sidebar';
import Header from '../../layouts/Header/header';
import EventCard from './components/EventCard/EventCard';
import EventModal from './components/EventModal/EventModal';
import InscriptionModal from './components/InscriptionModal/InscriptionModal';
import InscriptionsList from './components/InscriptionsList/InscriptionsList';
import Dashboard from './components/Dashboard/Dashboard';
import Agenda from './components/Agenda/Agenda';
import AttendanceModal from './components/AttendanceModal/AttendanceModal';
import eventService from '../../services/eventService';
import Encuestas from '../asistente/components/Encuestas/Encuestas'
import { useEvents } from './hooks/useEvents';
import { useInscriptions } from './hooks/useInscriptions';
import { formatFecha, formatHora, formatFechaCompleta } from './utils/dateUtils';
import { getEventStatus, validarFormularioInscripcion } from './utils/eventUtils';

const PATH_TO_VIEW = {
    '/asistente/eventos':       'eventos',
    '/asistente/agenda':        'agenda',
    '/asistente/encuestas':     'encuestas',
    '/asistente/inscripciones': 'misInscripciones',
    '/asistente/dashboard':     'dashboard',
};

const AsistentePanel = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const vistaActual = PATH_TO_VIEW[location.pathname] ?? 'dashboard';
    const [selectedEvento, setSelectedEvento] = useState(null);
    const [selectedInscripcion, setSelectedInscripcion] = useState(null);
    const [selectedActividad, setSelectedActividad] = useState('');
    const [actividadesDisponibles, setActividadesDisponibles] = useState([]);
    const [cargandoActividades, setCargandoActividades] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [modalType, setModalType] = useState('details');
    const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
    const toast = useToast();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [inscribiendo, setInscribiendo] = useState(false);
    const [, setCargandoDetalles] = useState(false);
    const [userData, setUserData] = useState(null);
    const [busqueda, setBusqueda] = useState('');

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
            return null;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        const userData = getUserData();
        setUserData(userData);
    }, []);

    const {
        eventos,
        eventosFiltrados,
        categorias,
        loading: loadingEventos,
        filtroCategoria,
        setFiltroCategoria,
        cargarEventosDisponibles
    } = useEvents();

    const {
        misInscripciones,
        eventosInscritos,
        asistenciasRegistradas,
        loading: loadingInscripciones,
        registrandoAsistencia,
        inscripcionRegistrando,
        cargarMisInscripciones,
        inscribirseEnEvento,
        handleRegistrarAsistencia,
        puedeRegistrarAsistencia,
        handleCancelarInscripcion,
        puedeCancelar
    } = useInscriptions();

    const filtrarEventosPorBusqueda = (eventos) => {
        if (!busqueda.trim()) return eventos;

        const terminoBusqueda = busqueda.toLowerCase().trim();
        return eventos.filter(evento =>
            evento.titulo?.toLowerCase().includes(terminoBusqueda) ||
            evento.descripcion?.toLowerCase().includes(terminoBusqueda) ||
            evento.lugar?.toLowerCase().includes(terminoBusqueda)
        );
    };

    const eventosFiltradosFinal = filtrarEventosPorBusqueda(eventosFiltrados);

    useEffect(() => {
        const checkAuth = () => {
            const accessToken = localStorage.getItem('access_token');
            const token = localStorage.getItem('token');
            const authToken = localStorage.getItem('auth_token');

            const hasToken = accessToken || token || authToken;

            if (!hasToken) {
                window.location.href = '/login';
                return;
            }
        };

        checkAuth();
        cargarEventosDisponibles();
        cargarMisInscripciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (misInscripciones.length > 0 && !selectedActividad) {
            const primeraActividad = misInscripciones.find(inscripcion =>
                inscripcion.evento?.actividades?.[0]
            )?.evento?.actividades?.[0];

            if (primeraActividad) {
                setSelectedActividad(primeraActividad.id_actividad);
            }
        }
    }, [misInscripciones, selectedActividad]);

    useEffect(() => {
        if (vistaActual === 'encuestas' && misInscripciones && misInscripciones.length > 0) {
            cargarActividadesDisponibles();
        } else if (vistaActual !== 'encuestas') {
            setActividadesDisponibles([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vistaActual, misInscripciones]);

    const showSnackbar = (message, severity = 'success') => {
        if (severity === 'error') toast.error(message);
        else if (severity === 'warning') toast.warning(message);
        else if (severity === 'info') toast.info(message);
        else toast.success(message);
    };

    const handleViewDetails = async (evento) => {
        setCargandoDetalles(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token disponible');
            }

            const eventoCompleto = await eventService.getEventDetails(evento.id, token);
            setSelectedEvento(eventoCompleto);
            setModalType('details');
            setDialogOpen(true);
        } catch (error) {
            setSelectedEvento(evento);
            setModalType('details');
            setDialogOpen(true);
            showSnackbar('No se pudieron cargar todos los detalles del evento', 'warning');
        } finally {
        setCargandoDetalles(false);
        }
    };

    const handleInscribe = (evento) => {
        if (eventosInscritos.has(evento.id)) {
            showSnackbar('Ya estás inscrito en este evento.', 'info');
            return;
        }

        const estado = getEventStatus(evento, eventosInscritos);
        if (estado.texto !== 'DISPONIBLE' && estado.texto !== 'POR COMENZAR') {
            showSnackbar('No es posible inscribirse en este evento porque está lleno o cerrado.', 'warning');
            return;
        }

        setSelectedEvento(evento);
        setModalType('inscription');
        setDialogOpen(true);
    };

    const handleConfirmInscription = async (formDataInscripcion) => {
        if (!selectedEvento) return;

        const validacion = validarFormularioInscripcion(formDataInscripcion);
        if (!validacion.isValid) {
            const primerError = Object.values(validacion.errors)[0];
            showSnackbar(primerError, 'error');
            return;
        }

        setInscribiendo(true);

        try {
            await inscribirseEnEvento(selectedEvento.id);

            showSnackbar('Tu inscripción al evento se ha realizado exitosamente. Recibirás un correo de confirmación.', 'success');
            setDialogOpen(false);

            await cargarEventosDisponibles();
            await cargarMisInscripciones();
        } catch (error) {
            showSnackbar(error.message, 'error');
        } finally {
            setInscribiendo(false);
        }
    };

    const handleOpenAttendanceModal = (inscripcion) => {
        setSelectedInscripcion(inscripcion);
        setAttendanceModalOpen(true);
    };

    const handleConfirmAttendance = async (codigoAsistencia) => {
        if (!selectedInscripcion) return;

        try {
            await handleRegistrarAsistencia(selectedInscripcion);
            showSnackbar('Asistencia registrada exitosamente', 'success');
            setAttendanceModalOpen(false);
            await cargarMisInscripciones();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleRegistrarAsistenciaDirecta = async (inscripcion) => {
        try {
            await handleRegistrarAsistencia(inscripcion);
            showSnackbar('Asistencia registrada exitosamente', 'success');
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const limpiarBusqueda = () => {
        setBusqueda('');
    };

    const cargarActividadesDisponibles = async () => {
        if (misInscripciones.length === 0) {
            setActividadesDisponibles([]);
            return;
        }

        setCargandoActividades(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token disponible');
            }

            const actividades = [];

            for (const inscripcion of misInscripciones) {
                try {
                    const eventId = inscripcion.id_evento || inscripcion.evento?.id;

                    if (!eventId) {
                        continue;
                    }

                    const eventoDetalle = await eventService.getEventDetails(eventId, token);

                    if (eventoDetalle.actividades && eventoDetalle.actividades.length > 0) {
                        eventoDetalle.actividades.forEach(actividad => {
                            const actividadInfo = {
                                id_actividad: actividad.id_actividad,
                                titulo: actividad.titulo,
                                fecha_actividad: actividad.fecha_actividad,
                                hora_inicio: actividad.hora_inicio,
                                hora_fin: actividad.hora_fin,
                                descripcion: actividad.descripcion,
                                id_evento: eventoDetalle.id,
                                evento_titulo: eventoDetalle.titulo,
                                evento_fecha_inicio: eventoDetalle.fecha_inicio,
                                evento_fecha_fin: eventoDetalle.fecha_fin,
                                lugares: actividad.lugares || []
                            };
                            actividades.push(actividadInfo);
                        });
                    }
                } catch (error) {
                    continue;
                }
            }

            setActividadesDisponibles(actividades);

            if (actividades.length > 0 && !selectedActividad) {
                const primeraActividadId = actividades[0].id_actividad.toString();
                setSelectedActividad(primeraActividadId);
            }
        } catch (error) {
            showSnackbar('Error al cargar las actividades disponibles', 'error');
        } finally {
            setCargandoActividades(false);
        }
    };

    const renderVista = () => {
        switch (vistaActual) {
            case 'dashboard':
                return (
                    <Dashboard
                        misInscripciones={misInscripciones}
                        eventosDisponibles={eventos}
                        onViewEvents={() => navigate('/asistente/eventos')}
                        onViewInscriptions={() => navigate('/asistente/inscripciones')}
                    />
                );

            case 'eventos':
                return (
                    <div className="flex-1 p-8 bg-slate-50">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 mb-6">
                            <h1 className="text-2xl font-bold text-slate-800 mb-1">Eventos Disponibles para Inscripción</h1>
                            <p className="text-sm text-slate-500">Explora los eventos disponibles e inscribete según tus intereses.</p>
                        </div>

                        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-4 items-center flex-wrap">
                            <div className="relative flex-1 min-w-[260px] max-w-[400px]">
                                <input
                                    type="text"
                                    placeholder="Buscar eventos por nombre, descripción o lugar..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                                {busqueda && (
                                    <button
                                        onClick={limpiarBusqueda}
                                        title="Limpiar búsqueda"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors text-base leading-none"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-3 items-center flex-wrap">
                                <select
                                    value={filtroCategoria}
                                    onChange={(e) => setFiltroCategoria(e.target.value)}
                                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                >
                                    <option value="">Todas las modalidades</option>
                                    {categorias.map((categoria) => (
                                        <option key={categoria} value={categoria}>{categoria}</option>
                                    ))}
                                </select>

                                <button
                                    onClick={() => navigate('/asistente/inscripciones')}
                                    className="h-9 px-4 rounded-lg text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                                >
                                    Mis Inscripciones
                                </button>
                            </div>
                        </div>

                        {loadingEventos ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-slate-500">Cargando eventos disponibles...</p>
                            </div>
                        ) : eventosFiltradosFinal.length === 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                                <p className="text-slate-600 font-medium">
                                    {eventos.length === 0
                                        ? 'Actualmente no hay eventos disponibles para inscripción.'
                                        : busqueda || filtroCategoria
                                            ? 'No se encontraron eventos con los filtros aplicados.'
                                            : 'No hay eventos disponibles.'}
                                </p>
                                {(busqueda || filtroCategoria) && (
                                    <button
                                        onClick={() => { setBusqueda(''); setFiltroCategoria(''); }}
                                        className="mt-4 h-9 px-5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                                    >
                                        Ver todos los eventos
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {eventosFiltradosFinal.map((evento) => (
                                    <EventCard
                                        key={evento.id}
                                        evento={evento}
                                        estado={getEventStatus(evento, eventosInscritos)}
                                        onViewDetails={handleViewDetails}
                                        onInscribe={handleInscribe}
                                        formatFecha={formatFecha}
                                        formatHora={formatHora}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'agenda':
                return (
                    <div className="flex-1 p-8 bg-slate-50">
                        <Agenda
                            misInscripciones={misInscripciones}
                            onRegisterAttendance={handleOpenAttendanceModal}
                        />
                    </div>
                );

            case 'misInscripciones':
                return (
                    <div className="flex-1 p-8 bg-slate-50">
                        <InscriptionsList
                            misInscripciones={misInscripciones}
                            loading={loadingInscripciones}
                            asistenciasRegistradas={asistenciasRegistradas}
                            registrandoAsistencia={registrandoAsistencia}
                            inscripcionRegistrando={inscripcionRegistrando}
                            handleRegistrarAsistencia={handleRegistrarAsistenciaDirecta}
                            puedeRegistrarAsistencia={puedeRegistrarAsistencia}
                            handleCancelarInscripcion={handleCancelarInscripcion}
                            puedeCancelar={puedeCancelar}
                            formatFecha={formatFecha}
                            formatHora={formatHora}
                            onViewEvents={() => navigate('/asistente/eventos')}
                        />
                    </div>
                );

            case 'encuestas':
                return (
                    <div className="flex-1 p-8 bg-slate-50">
                        {cargandoActividades ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-slate-500">Cargando actividades disponibles...</p>
                            </div>
                        ) : actividadesDisponibles.length === 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">No hay actividades disponibles</h3>
                                <p className="text-sm text-slate-500">
                                    {misInscripciones.length === 0
                                        ? 'No estás inscrito en ningún evento. Inscríbete en un evento primero.'
                                        : 'Los eventos en los que estás inscrito no tienen actividades asignadas o no se pudieron cargar.'}
                                </p>
                                {misInscripciones.length === 0 && (
                                    <button
                                        onClick={() => navigate('/asistente/eventos')}
                                        className="mt-2 h-9 px-5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                                    >
                                        Ver eventos disponibles
                                    </button>
                                )}
                            </div>
                        ) : (
                            <Encuestas
                                actividadesDisponibles={actividadesDisponibles}
                                cargandoActividades={cargandoActividades}
                            />
                        )}
                    </div>
                );

            default:
                return <Dashboard misInscripciones={misInscripciones} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar
                onToggle={(collapsed) => setSidebarCollapsed(collapsed)}
            />

            <div className={`flex-1 flex flex-col min-h-screen transition-[margin-left] duration-300 ${sidebarCollapsed ? 'ml-[80px]' : 'ml-[250px]'}`}>
                <Header
                    userEmail={userData ? `${userData.nombre} (${userData.email})` : "Cargando..."}
                    userRole="Asistente"
                />

                {renderVista()}
            </div>

            <Dialog
                open={dialogOpen && !!selectedEvento}
                onOpenChange={(open) => !open && !inscribiendo && setDialogOpen(false)}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {modalType === 'details'
                                ? 'Detalles Completos del Evento'
                                : 'Confirmar Inscripción'
                            }
                        </DialogTitle>
                    </DialogHeader>

                    {selectedEvento && (modalType === 'details' ? (
                        <EventModal
                            evento={selectedEvento}
                            onClose={() => setDialogOpen(false)}
                            formatFecha={formatFecha}
                            formatFechaCompleta={formatFechaCompleta}
                        />
                    ) : (
                        <InscriptionModal
                            evento={selectedEvento}
                            onClose={() => setDialogOpen(false)}
                            onConfirm={handleConfirmInscription}
                            formatFecha={formatFecha}
                            loading={inscribiendo}
                            userData={userData}
                        />
                    ))}
                </DialogContent>
            </Dialog>

            {attendanceModalOpen && selectedInscripcion && (
                <AttendanceModal
                    inscripcion={selectedInscripcion}
                    onClose={() => setAttendanceModalOpen(false)}
                    onConfirm={handleConfirmAttendance}
                    loading={registrandoAsistencia}
                />
            )}

        </div>
    );
};

export default AsistentePanel;