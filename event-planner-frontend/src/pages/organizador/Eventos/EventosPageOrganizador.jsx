import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Calendar, CalendarDays, Plus, Search, Pencil, Eye, Trash2, X, MapPin, Users, FileText, AlertCircle, DollarSign, Ban, Bell, Send } from 'lucide-react';
import { obtenerEventos, eliminarEvento, cancelarEvento, obtenerPerfil } from "../../../components/eventosService";
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import Sidebar from '../Sidebar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogFooter, DialogDescription
} from '../../../components/ui/dialog';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '../../../components/ui/table';

// [FRONTEND-FIX] L1: Mapeo de estados con variantes Badge shadcn/ui
const ESTADOS_EVENTO = {
    0: { texto: 'Borrador',   variant: 'draft' },
    1: { texto: 'Publicado',  variant: 'published' },
    2: { texto: 'Cancelado',  variant: 'cancelled' },
    3: { texto: 'Finalizado', variant: 'finished' },
};

const EventosPageOrganizador = () => {
    const navigate = useNavigate();
    const [eventos, setEventos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVerVisible, setModalVerVisible] = useState(false);
    const [eventoAEliminar, setEventoAEliminar] = useState(null);
    const [eventoAVer, setEventoAVer] = useState(null);
    const [loadingEliminar, setLoadingEliminar] = useState(false);
    // FIX 2: Cancelar evento
    const [modalCancelarVisible, setModalCancelarVisible] = useState(false);
    const [eventoACancelar, setEventoACancelar] = useState(null);
    const [loadingCancelar, setLoadingCancelar] = useState(false);
    // FIX 5: Notificaciones manuales
    const [modalNotifVisible, setModalNotifVisible] = useState(false);
    const [eventoNotif, setEventoNotif] = useState(null);
    const [notifForm, setNotifForm] = useState({ asunto: '', mensaje: '' });
    const [loadingNotif, setLoadingNotif] = useState(false);
    const [notifSuccess, setNotifSuccess] = useState(false);
    // [UI-FIX] U2: Estado de error inline en lugar de alert()
    const [errorMsg, setErrorMsg] = useState(null);
    // [UI-FIX] U3: Estado de carga para spinner
    const [loadingEventos, setLoadingEventos] = useState(true);
    // U4: Focus trap y Escape manejados nativamente por Radix Dialog

    const cargarEventos = async () => {
        try {
            setLoadingEventos(true);
            const perfil = await obtenerPerfil();
            // Obtener id del creador desde distintas formas según la respuesta del endpoint
            const idCreador = perfil?.data?.usuario?.id
                || perfil?.data?.id
                || perfil?.usuario?.id
                || perfil?.id
                || perfil?.usuario_id
                || null;

            const data = await obtenerEventos();
            const listaEventos = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

            // Normalizar y filtrar por posibles campos de creador
            const eventosDelCreador = listaEventos.filter((e) => {
                if (!idCreador) return false;
                const creadorFields = [
                    e.id_creador,
                    e.creador?.id,
                    e.creador_id,
                    e.usuario?.id,
                    e.usuario_id,
                    e.idCreador,
                    e.owner_id,
                    e.owner?.id
                ];

                return creadorFields.some(field => String(field) === String(idCreador));
            });

            setEventos(eventosDelCreador);
        } catch (error) {
            // [UI-FIX] U2: Error inline en vez de alert()
            setErrorMsg("Error al cargar eventos.");
        } finally {
            setLoadingEventos(false);
        }
    };

    useEffect(() => {
        cargarEventos();
    }, []);

    const confirmarEliminar = (evento) => {
        setEventoAEliminar(evento);
        setModalVisible(true);
    };

    const verEvento = (evento) => {
        setEventoAVer(evento);
        console.log(evento)
        setModalVerVisible(true);
    };

    const handleEliminar = async () => {
        if (!eventoAEliminar) return;

        try {
            setLoadingEliminar(true);
            await eliminarEvento(eventoAEliminar.id);

            setModalVisible(false);
            setEventoAEliminar(null);

            // Volver a cargar los eventos filtrados por organizador
            await cargarEventos();
        } catch {
            // [UI-FIX] U2: Error inline en vez de alert()
            setErrorMsg('Error al eliminar el evento.');
        } finally {
            setLoadingEliminar(false);
        }
    };

    const confirmarCancelar = (evento) => {
        setEventoACancelar(evento);
        setModalCancelarVisible(true);
    };

    const handleCancelar = async () => {
        if (!eventoACancelar) return;
        try {
            setLoadingCancelar(true);
            await cancelarEvento(eventoACancelar.id);
            setModalCancelarVisible(false);
            setEventoACancelar(null);
            await cargarEventos();
        } catch {
            setErrorMsg('Error al cancelar el evento.');
        } finally {
            setLoadingCancelar(false);
        }
    };

    const abrirNotificaciones = (evento) => {
        setEventoNotif(evento);
        setNotifForm({ asunto: '', mensaje: '' });
        setNotifSuccess(false);
        setModalNotifVisible(true);
    };

    const handleEnviarNotificacion = async (e) => {
        e.preventDefault();
        if (!eventoNotif || !notifForm.asunto.trim() || !notifForm.mensaje.trim()) return;
        try {
            setLoadingNotif(true);
            const token = localStorage.getItem('access_token');
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
            const res = await fetch(`${API_URL}/eventos/${eventoNotif.id}/notificaciones-manuales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ asunto: notifForm.asunto, mensaje: notifForm.mensaje }),
            });
            const data = await res.json();
            if (res.ok && (data.success !== false)) {
                setNotifSuccess(true);
                setNotifForm({ asunto: '', mensaje: '' });
            } else {
                setErrorMsg(data.message || 'Error al enviar la notificación.');
                setModalNotifVisible(false);
            }
        } catch {
            setErrorMsg('Error al enviar la notificación.');
            setModalNotifVisible(false);
        } finally {
            setLoadingNotif(false);
        }
    };

    const eventosVisibles = eventos.filter(evento =>
        evento.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Agregar función para parsear fechas correctamente
    const parsearFecha = (fechaString) => {
        const [year, month, day] = fechaString.split('T')[0].split('-');
        return new Date(year, month - 1, day);
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar fijo de 280px */}
            <Sidebar />

            {/* Área de contenido principal desplazada por el sidebar */}
            <main className="flex-1 ml-0 md:ml-[280px] p-6 lg:p-8">

                {/* ── Page header ────────────────────────────────────────── */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-600 text-white shrink-0">
                        <CalendarDays size={20} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestionar Eventos</h1>
                </div>

                {/* ── Error banner ────────────────────────────────────────── */}
                {errorMsg && (
                    <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 mb-4" role="alert">
                        <AlertCircle size={16} className="shrink-0 text-rose-600" />
                        <span className="flex-1">{errorMsg}</span>
                        <button
                            onClick={() => setErrorMsg(null)}
                            aria-label="Cerrar error"
                            className="text-rose-500 hover:text-rose-700 transition-colors"
                        >
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* ── Action bar ─────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Buscar eventos por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 h-9 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                        />
                    </div>
                    <Button
                        onClick={() => navigate('/organizador/eventos/crear')}
                        className="flex items-center gap-2 shrink-0"
                    >
                        <Plus size={16} />
                        Crear Evento
                    </Button>
                </div>

                {/* ── Tabla / skeleton ─────────────────────────────────── */}
                {loadingEventos ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full rounded-md" />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead>Evento</TableHead>
                                    <TableHead><span className="flex items-center gap-1"><CalendarDays size={13} />Inicio</span></TableHead>
                                    <TableHead><span className="flex items-center gap-1"><CalendarDays size={13} />Fin</span></TableHead>
                                    <TableHead>Modalidad</TableHead>
                                    <TableHead><span className="flex items-center gap-1"><Users size={13} />Inscritos</span></TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {eventosVisibles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
                                                <Calendar size={40} className="text-slate-300" />
                                                <p className="text-sm font-medium">No hay eventos registrados</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate('/organizador/eventos/crear')}
                                                >
                                                    Crear tu primer evento
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    eventosVisibles.map((evento) => (
                                        <TableRow key={evento.id}>
                                            <TableCell className="font-medium text-slate-900 max-w-[180px] truncate">
                                                {evento.titulo}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {parsearFecha(evento.fecha_inicio).toLocaleDateString('es-ES')}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {parsearFecha(evento.fecha_fin).toLocaleDateString('es-ES')}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {evento.modalidad}
                                            </TableCell>
                                            <TableCell>
                                                {/* [FRONTEND-FIX] L2: Inscritos reales */}
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                                                    <Users size={11} />
                                                    {evento.inscripciones?.length ?? 0}/{evento.cupos}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={ESTADOS_EVENTO[evento.estado]?.variant || 'secondary'}>
                                                    {ESTADOS_EVENTO[evento.estado]?.texto || 'Desconocido'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/organizador/eventos/editar/${evento.id}`)}
                                                        className="text-slate-600 hover:text-brand-600 h-7 px-2"
                                                    >
                                                        <Pencil size={13} />
                                                        <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">Editar</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => verEvento(evento)}
                                                        className="text-slate-600 hover:text-sky-600 h-7 px-2"
                                                    >
                                                        <Eye size={13} />
                                                        <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">Ver</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/organizador/eventos/${evento.id}/presupuesto`)}
                                                        className="text-slate-600 hover:text-emerald-600 h-7 px-2"
                                                        title="Gestionar presupuesto"
                                                    >
                                                        <DollarSign size={13} />
                                                        <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">Presupuesto</span>
                                                    </Button>
                                                    {/* FIX 2: Cancelar — solo visible si estado es Publicado (1) */}
                                                    {evento.estado === 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => confirmarCancelar(evento)}
                                                            className="text-slate-600 hover:text-amber-600 h-7 px-2"
                                                            title="Cancelar evento"
                                                        >
                                                            <Ban size={13} />
                                                            <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">Cancelar</span>
                                                        </Button>
                                                    )}
                                                    {/* FIX 5: Notificaciones manuales */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => abrirNotificaciones(evento)}
                                                        className="text-slate-600 hover:text-violet-600 h-7 px-2"
                                                        title="Enviar notificación a inscritos"
                                                    >
                                                        <Bell size={13} />
                                                        <span className="sr-only">Notificar</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => confirmarEliminar(evento)}
                                                        className="text-slate-600 hover:text-rose-600 h-7 px-2"
                                                    >
                                                        <Trash2 size={13} />
                                                        <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">Eliminar</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </main>

            {/* ── Dialog: Confirmar cancelación ───────────────────────────────── */}
            <Dialog open={modalCancelarVisible} onOpenChange={setModalCancelarVisible}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Ban size={18} className="text-amber-500" />
                            Cancelar evento
                        </DialogTitle>
                        <DialogDescription>
                            ¿Deseas cancelar el evento{' '}
                            <strong className="text-slate-900">{eventoACancelar?.titulo}</strong>?{' '}
                            El evento cambiará a estado <strong>Cancelado</strong> y los inscritos serán notificados.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setModalCancelarVisible(false)} disabled={loadingCancelar}>
                            Volver
                        </Button>
                        <Button variant="destructive" onClick={handleCancelar} disabled={loadingCancelar}
                            className="bg-amber-600 hover:bg-amber-700">
                            {loadingCancelar ? 'Cancelando...' : 'Sí, cancelar evento'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Dialog: Notificaciones manuales ──────────────────────────────── */}
            <Dialog open={modalNotifVisible} onOpenChange={(open) => { setModalNotifVisible(open); if (!open) setNotifSuccess(false); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bell size={18} className="text-violet-600" />
                            Enviar notificación a inscritos
                        </DialogTitle>
                        <DialogDescription>
                            El mensaje será enviado a todos los inscritos del evento{' '}
                            <strong className="text-slate-900">{eventoNotif?.titulo}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    {notifSuccess ? (
                        <div className="flex flex-col items-center gap-3 py-6 text-center">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100">
                                <Send size={24} className="text-emerald-600" />
                            </div>
                            <p className="font-semibold text-slate-800">¡Notificación enviada!</p>
                            <p className="text-sm text-slate-500">Todos los inscritos han recibido el mensaje.</p>
                            <Button variant="outline" onClick={() => setModalNotifVisible(false)} className="mt-2">
                                Cerrar
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleEnviarNotificacion} className="space-y-4 mt-1">
                            <div className="space-y-1.5">
                                <Label htmlFor="notif-asunto">Asunto *</Label>
                                <Input
                                    id="notif-asunto"
                                    placeholder="Ej: Recordatorio de asistencia"
                                    value={notifForm.asunto}
                                    onChange={(e) => setNotifForm(p => ({ ...p, asunto: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="notif-mensaje">Mensaje *</Label>
                                <Textarea
                                    id="notif-mensaje"
                                    placeholder="Escribe aquí el mensaje para los inscritos..."
                                    value={notifForm.mensaje}
                                    onChange={(e) => setNotifForm(p => ({ ...p, mensaje: e.target.value }))}
                                    rows={4}
                                    required
                                />
                            </div>
                            <DialogFooter className="gap-2">
                                <Button type="button" variant="outline" onClick={() => setModalNotifVisible(false)} disabled={loadingNotif}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loadingNotif || !notifForm.asunto.trim() || !notifForm.mensaje.trim()} className="gap-2">
                                    <Send size={14} />
                                    {loadingNotif ? 'Enviando...' : 'Enviar notificación'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── Dialog: Confirmar eliminación (Radix — focus trap + Esc nativo) ── */}
            <Dialog open={modalVisible} onOpenChange={setModalVisible}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Deseas eliminar el evento <strong className="text-slate-900">{eventoAEliminar?.titulo}</strong>? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setModalVisible(false)} disabled={loadingEliminar}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleEliminar} disabled={loadingEliminar}>
                            {loadingEliminar ? 'Eliminando...' : 'Sí, eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Dialog: Ver detalle del evento ───────────────────────────────── */}
            <Dialog open={modalVerVisible} onOpenChange={setModalVerVisible}>
                <DialogContent className="max-w-2xl">
                    {eventoAVer && (
                        <>
                            <DialogHeader>
                                <div className="flex items-start gap-3 pr-6">
                                    <DialogTitle className="flex-1 text-xl">{eventoAVer.titulo}</DialogTitle>
                                    <Badge variant={ESTADOS_EVENTO[eventoAVer.estado]?.variant || 'secondary'} className="shrink-0 mt-0.5">
                                        {ESTADOS_EVENTO[eventoAVer.estado]?.texto}
                                    </Badge>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4 mt-2">
                                {/* Descripción */}
                                {eventoAVer.descripcion && (
                                    <div className="rounded-lg border border-slate-200 p-4">
                                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-sky-600">
                                                <FileText size={13} />
                                            </span>
                                            Descripción
                                        </p>
                                        <p className="text-sm text-slate-600 leading-relaxed">{eventoAVer.descripcion}</p>
                                    </div>
                                )}

                                {/* Fechas */}
                                <div className="rounded-lg border border-slate-200 p-4">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600">
                                            <CalendarDays size={13} />
                                        </span>
                                        Fechas del Evento
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { label: 'Inicio', value: parsearFecha(eventoAVer.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) },
                                            { label: 'Fin',    value: parsearFecha(eventoAVer.fecha_fin).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) },
                                            { label: 'Hora',   value: eventoAVer.hora ? new Date(`1970-01-01T${eventoAVer.hora}`).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'Sin hora' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="rounded-md bg-slate-50 px-3 py-2">
                                                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                                                <p className="text-sm font-medium text-slate-800">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Asistencia */}
                                <div className="rounded-lg border border-slate-200 p-4">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-sky-600">
                                            <Users size={13} />
                                        </span>
                                        Información de Asistencia
                                    </p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'Modalidad',     value: eventoAVer.modalidad },
                                            { label: 'Cupos totales', value: eventoAVer.cupos },
                                            { label: 'Inscritos',     value: `${eventoAVer.inscripciones?.length ?? 0}/${eventoAVer.cupos}` },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="rounded-md bg-slate-50 px-3 py-2">
                                                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                                                <p className="text-sm font-medium text-slate-800">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Ubicación */}
                                {eventoAVer.modalidad !== 'Virtual' && eventoAVer.lugar && (
                                    <div className="rounded-lg border border-slate-200 p-4">
                                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600">
                                                <MapPin size={13} />
                                            </span>
                                            Ubicación
                                        </p>
                                        <p className="flex items-center gap-1.5 text-sm text-slate-600">
                                            <MapPin size={14} className="text-slate-400 shrink-0" />
                                            {eventoAVer.lugar.nombre} — {eventoAVer.lugar.ubicacion?.direccion || 'Sin dirección'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="gap-2 mt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setModalVerVisible(false)}
                                >
                                    Cerrar
                                </Button>
                                <Button
                                    onClick={() => { setModalVerVisible(false); navigate(`/organizador/eventos/editar/${eventoAVer.id}`); }}
                                    className="gap-1.5"
                                >
                                    <Pencil size={14} />
                                    Editar Evento
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EventosPageOrganizador;
