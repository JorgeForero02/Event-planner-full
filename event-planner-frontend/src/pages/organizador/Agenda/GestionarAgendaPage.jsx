import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Calendar,
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    User,
    Clock,
    MapPin,
    Eye,
    Sparkles,
} from 'lucide-react';
import {
    obtenerEventoPorId,
    obtenerActividadesEvento,
    eliminarActividad,
    obtenerPonenteAsignado,
    crearActividad
} from '../../../components/eventosService';
import './GestionarAgendaPage.css';
import Sidebar from '../Sidebar';
import GerenteSidebar from '../../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { useToast } from '../../../contexts/ToastContext';
import { Button } from '../../../components/ui/button';
import IAAsistente from '../../../components/IAAsistente';

const GestionarAgendaPage = () => {
    const navigate = useNavigate();
    const { eventoId } = useParams();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/gerente') ? '/gerente' : '/organizador';
    const toast = useToast();
    const [evento, setEvento] = useState(null);
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actividadesPorFecha, setActividadesPorFecha] = useState({});
    const [ponentesAsignados, setPonentesAsignados] = useState({});
    const [modalAbierto, setModalAbierto] = useState(false);
    const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [mostrarIA, setMostrarIA] = useState(false);
    const [creandoActividades, setCreandoActividades] = useState(false);
    const [progreso, setProgreso] = useState({ actual: 0, total: 0 });

    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);

            const eventoData = await obtenerEventoPorId(eventoId);
            setEvento(eventoData.data);

            const actividadesData = await obtenerActividadesEvento(eventoId);
            const acts = Array.isArray(actividadesData.data)
                ? actividadesData.data
                : [actividadesData.data];
            setActividades(acts);
            agruparActividadesPorFecha(acts);

            await cargarPonentesAsignados(acts);
        } catch {
        } finally {
            setLoading(false);
        }
    }, [eventoId]);

    const cargarPonentesAsignados = async (actividades) => {
        const ponentesMap = {};

        for (const actividad of actividades) {
            try {
                const response = await obtenerPonenteAsignado(actividad.id_actividad);
                if (response.success && response.data.length > 0) {
                    const asignacion = response.data[0];
                    ponentesMap[actividad.id_actividad] = asignacion.ponente?.usuario?.nombre || 'Pendiente';
                } else {
                    ponentesMap[actividad.id_actividad] = 'Pendiente';
                }
            } catch {
                ponentesMap[actividad.id_actividad] = 'Pendiente';
            }
        }

        setPonentesAsignados(ponentesMap);
    };

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const agruparActividadesPorFecha = (acts) => {
        const agrupadas = acts.reduce((acc, actividad) => {
            const fecha = actividad.fecha_actividad.split('T')[0];
            const [year, month, day] = fecha.split('-');
            const fechaFormateada = `${day}/${month}/${year}`;

            if (!acc[fechaFormateada]) {
                acc[fechaFormateada] = [];
            }
            acc[fechaFormateada].push(actividad);
            return acc;
        }, {});
        setActividadesPorFecha(agrupadas);
    };

    const puedeEliminar = (actividad) => {
        const estado = (actividad.estado ?? '').toLowerCase();
        return estado !== 'en_curso' && estado !== 'en curso' && estado !== 'finalizada' && estado !== 'finalizado';
    };

    const handleEliminar = (actividadId) => {
        setConfirmDeleteId(actividadId);
    };

    const handleAplicarIA = async (estructura) => {
        const actividadesRaw = estructura.actividades || [];
        if (!actividadesRaw.length) return;
        // Deduplicate by title to prevent IA from re-creating activities from previous turns
        const vistas = new Set();
        const actividades = actividadesRaw.filter(a => {
            const key = (a.titulo || '').trim().toLowerCase();
            if (vistas.has(key)) return false;
            vistas.add(key);
            return true;
        });
        setMostrarIA(false);
        setCreandoActividades(true);
        setProgreso({ actual: 0, total: actividades.length });
        let exitosas = 0;
        const errores = [];
        for (let i = 0; i < actividades.length; i++) {
            const act = actividades[i];
            setProgreso({ actual: i + 1, total: actividades.length });
            try {
                // Normalizar formatos que la IA podría devolver incorrectamente
                const horaInicio = (act.hora_inicio || '').slice(0, 5);
                const horaFin = (act.hora_fin || '').slice(0, 5);
                const fecha = (act.fecha_actividad || '').slice(0, 10);
                await crearActividad(eventoId, {
                    titulo: act.titulo,
                    descripcion: act.descripcion || '',
                    fecha_actividad: fecha,
                    hora_inicio: horaInicio,
                    hora_fin: horaFin,
                    lugares: [],
                    presupuesto: 0,
                });
                exitosas++;
            } catch (err) {
                const msg = err?.response?.data?.message || err?.message || 'Error desconocido';
                errores.push(`"${act.titulo}": ${msg}`);
            }
        }
        setCreandoActividades(false);
        setProgreso({ actual: 0, total: 0 });
        if (exitosas > 0) {
            toast.success(`${exitosas} actividad${exitosas !== 1 ? 'es' : ''} creada${exitosas !== 1 ? 's' : ''} exitosamente`);
            await cargarDatos();
        }
        errores.forEach(e => toast.error(e));
    };

    const confirmarEliminar = async () => {
        try {
            await eliminarActividad(confirmDeleteId);
            setConfirmDeleteId(null);
            await cargarDatos();
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Error al eliminar la actividad';
            toast.error(msg);
            setConfirmDeleteId(null);
        }
    };

    const handleVerActividad = (actividad) => {
        setActividadSeleccionada(actividad);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setActividadSeleccionada(null);
    };

    const formatearHora = (hora) => {
        if (!hora) return '';
        return hora.substring(0, 5);
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const [year, month, day] = fecha.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    };

    if (loading) {
        return (
            <div className="gestionar-agenda-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando agenda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="gestionar-agenda-page">
            {basePath === '/gerente' ? <GerenteSidebar /> : <Sidebar />}
            <div className="agenda-container">
                <div className="page-header-agenda">
                    <Calendar size={28} className="header-icon-agenda" />
                    <h1>Gestionar Agenda</h1>
                </div>

                <div className="evento-info-card">
                    <h3>{evento?.titulo}</h3>
                    <p className="evento-fechas">
                        {evento?.fecha_inicio?.split('T')[0].split('-').reverse().join('/')} - {evento?.fecha_fin?.split('T')[0].split('-').reverse().join('/')}
                    </p>
                </div>

                <div className="acciones-header">
                    <button
                        onClick={() => navigate(basePath)}
                        className="btn-volver"
                    >
                        <ArrowLeft size={18} />
                        Volver a Eventos
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setMostrarIA(true)}
                            className="btn-crear-actividad"
                            style={{ backgroundColor: '#7c3aed' }}
                        >
                            <Sparkles size={18} />
                            Planificar con IA
                        </button>
                        <button
                            onClick={() => navigate(`${basePath}/eventos/${eventoId}/actividades/crear`)}
                            className="btn-crear-actividad"
                        >
                            <Plus size={18} />
                            Crear Actividad
                        </button>
                    </div>
                </div>

                <div className="estadisticas-grid">
                    <div className="estadistica-card">
                        <div className="estadistica-icon blue">
                            <Calendar size={24} />
                        </div>
                        <div className="estadistica-content">
                            <p className="estadistica-label">Total Actividades</p>
                            <p className="estadistica-valor">{actividades.length}</p>
                        </div>
                    </div>
                </div>

                {Object.entries(actividadesPorFecha).map(([fecha, acts]) => (
                    <div key={fecha} className="fecha-seccion">
                        <div className="fecha-header">
                            <Calendar size={20} />
                            <h3>{fecha}</h3>
                        </div>

                        <div className="actividades-tabla">
                            <div className="tabla-header">
                                <div className="col-titulo">TÍTULO</div>
                                <div className="col-ponente">PONENTE</div>
                                <div className="col-horario">HORARIO</div>
                                <div className="col-sala">SALA</div>
                                <div className="col-acciones">ACCIONES</div>
                            </div>

                            {acts.map((actividad) => (
                                <div key={actividad.id_actividad} className="tabla-row">
                                    <div className="col-titulo">
                                        <div className="actividad-titulo-info">
                                            <h4>{actividad.titulo}</h4>
                                            <p>{actividad.descripcion}</p>
                                        </div>
                                    </div>

                                    <div className="col-ponente">
                                        <div className="ponente-info">
                                            <User size={16} />
                                            <span>
                                                {ponentesAsignados[actividad.id_actividad] || 'Cargando...'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-horario">
                                        <div className="horario-info">
                                            <Clock size={16} />
                                            <span>
                                                {formatearHora(actividad.hora_inicio)} - {formatearHora(actividad.hora_fin)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-sala">
                                        <div className="sala-info">
                                            <MapPin size={16} />
                                            <span>{actividad.lugares?.[0]?.nombre || 'Sin sala'}</span>
                                        </div>
                                    </div>

                                    <div className="col-acciones">
                                        <button
                                            onClick={() => handleVerActividad(actividad)}
                                            className="btn-accion btn-ver-accion"
                                            title="Ver detalles"
                                        >
                                            <Eye size={16} />
                                            Ver
                                        </button>
                                        <button
                                            onClick={() => {
                                                sessionStorage.setItem('currentEventoId', eventoId);
                                                navigate(`${basePath}/actividades/${actividad.id_actividad}/editar`);
                                            }}
                                            className="btn-accion btn-editar-accion"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => puedeEliminar(actividad) && handleEliminar(actividad.id_actividad)}
                                            className={`btn-accion btn-eliminar-accion ${!puedeEliminar(actividad) ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            title={!puedeEliminar(actividad) ? 'No se puede eliminar una actividad en curso o finalizada' : 'Eliminar'}
                                            disabled={!puedeEliminar(actividad)}
                                        >
                                            <Trash2 size={16} />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {actividades.length === 0 && (
                    <div className="empty-actividades">
                        <Calendar size={64} className="empty-icon" />
                        <h3>No hay actividades programadas</h3>
                        <p>Crea tu primera actividad para comenzar a gestionar la agenda</p>
                        <button
                            onClick={() => navigate(`${basePath}/eventos/${eventoId}/actividades/crear`)}
                            className="btn-crear-actividad"
                        >
                            <Plus size={18} />
                            Crear Primera Actividad
                        </button>
                    </div>
                )}
            </div>

            <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-600">¿Estás seguro de eliminar esta actividad? Esta acción no se puede deshacer.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmarEliminar}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={modalAbierto && !!actividadSeleccionada}
                onOpenChange={(open) => !open && cerrarModal()}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalles de la Actividad</DialogTitle>
                    </DialogHeader>

                        <div className="modal-body">
                            <div className="modal-card">
                                <div className="modal-card-header">
                                    <div className="card-icon blue">
                                        <Calendar size={18} />
                                    </div>
                                    <h3>Información General</h3>
                                </div>
                                <div className="modal-card-content">
                                    <div className="info-row">
                                        <span className="info-label">Título</span>
                                        <span className="info-value">{actividadSeleccionada?.titulo}</span>
                                    </div>
                                    <div className="info-row full-width">
                                        <span className="info-label">Descripción</span>
                                        <span className="info-value description">{actividadSeleccionada?.descripcion || 'Sin descripción disponible'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-cards-row">
                                <div className="modal-card">
                                    <div className="modal-card-header">
                                        <div className="card-icon purple">
                                            <Clock size={18} />
                                        </div>
                                        <h3>Fecha y Horario</h3>
                                    </div>
                                    <div className="modal-card-content">
                                        <div className="info-item">
                                            <Calendar size={16} className="item-icon" />
                                            <div>
                                                <span className="item-label">Fecha</span>
                                                <span className="item-value">{formatearFecha(actividadSeleccionada?.fecha_actividad)}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <Clock size={16} className="item-icon" />
                                            <div>
                                                <span className="item-label">Horario</span>
                                                <span className="item-value">
                                                    {formatearHora(actividadSeleccionada?.hora_inicio)} - {formatearHora(actividadSeleccionada?.hora_fin)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-card">
                                    <div className="modal-card-header">
                                        <div className="card-icon green">
                                            <MapPin size={18} />
                                        </div>
                                        <h3>Ubicación</h3>
                                    </div>
                                    <div className="modal-card-content">
                                        <div className="info-item">
                                            <MapPin size={16} className="item-icon" />
                                            <div>
                                                <span className="item-label">Sala/Lugar</span>
                                                <span className="item-value">{actividadSeleccionada?.lugares?.[0]?.nombre || 'Sin sala asignada'}</span>
                                            </div>
                                        </div>
                                        {actividadSeleccionada?.lugares?.[0]?.direccion && (
                                            <div className="info-item">
                                                <MapPin size={16} className="item-icon" />
                                                <div>
                                                    <span className="item-label">Dirección</span>
                                                    <span className="item-value small">{actividadSeleccionada?.lugares?.[0]?.direccion}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-card">
                                <div className="modal-card-header">
                                    <div className="card-icon orange">
                                        <User size={18} />
                                    </div>
                                    <h3>Ponente Asignado</h3>
                                </div>
                                <div className="modal-card-content">
                                    <div className="ponente-card">
                                        <div className="ponente-avatar">
                                            <User size={24} />
                                        </div>
                                        <div className="ponente-info-modal">
                                            <span className="ponente-name">{ponentesAsignados[actividadSeleccionada?.id_actividad] || 'Pendiente de asignación'}</span>
                                            <span className="ponente-role">Ponente principal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <button
                                onClick={cerrarModal}
                                className="btn-modal btn-secondary"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={() => {
                                    sessionStorage.setItem('currentEventoId', eventoId);
                                    navigate(`${basePath}/actividades/${actividadSeleccionada?.id_actividad}/editar`);
                                }}
                                className="btn-modal btn-primary"
                            >
                                <Edit size={18} />
                                Editar Actividad
                            </button>
                        </DialogFooter>
                </DialogContent>
            </Dialog>

            {mostrarIA && (
                <IAAsistente
                    modo="agenda"
                    contexto={{
                        titulo: evento?.titulo,
                        fecha_inicio: evento?.fecha_inicio?.split('T')[0],
                        fecha_fin: evento?.fecha_fin?.split('T')[0],
                        actividades_existentes: actividades.map(a => ({
                            titulo: a.titulo,
                            fecha: a.fecha_actividad?.split('T')[0],
                            hora_inicio: a.hora_inicio,
                            hora_fin: a.hora_fin,
                        })),
                    }}
                    onAplicar={handleAplicarIA}
                    onCerrar={() => setMostrarIA(false)}
                />
            )}

            {/* Overlay de progreso al crear actividades con IA */}
            {creandoActividades && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm gap-5">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center space-y-5">
                        <div className="relative mx-auto w-16 h-16">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-brand-600 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles size={20} className="text-brand-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-slate-800">Creando actividades...</p>
                            <p className="text-sm text-slate-500">
                                {progreso.actual} de {progreso.total}
                            </p>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                                className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: progreso.total ? `${(progreso.actual / progreso.total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionarAgendaPage;