import React from 'react';
import { Calendar, Hash, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatRangoFechas } from '../../utils/dateUtils';

const STATUS_CLASSES = {
    'Registrado':   'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'Pendiente':    'bg-amber-50 text-amber-700 border border-amber-200',
    'No iniciado':  'bg-slate-100 text-slate-600 border border-slate-200',
    'Finalizado':   'bg-slate-100 text-slate-600 border border-slate-200',
};

const MSG_CLASSES = {
    'Asistencia ya registrada':     'text-emerald-600',
    'Puede registrar asistencia':   'text-amber-600',
    'El evento aún no ha comenzado': 'text-slate-500',
    'El evento ya finalizó':          'text-slate-500',
};

const InscriptionsList = ({
    misInscripciones,
    loading,
    asistenciasRegistradas,
    registrandoAsistencia,
    inscripcionRegistrando,
    handleRegistrarAsistencia,
    puedeRegistrarAsistencia,
    handleCancelarInscripcion,
    puedeCancelar,
    formatFecha,
    formatHora,
    onViewEvents
}) => {

    const formatHoraLocal = (hora) => {
        if (!hora) return '';
        return hora.substring(0, 5);
    };

    const getRangoFechasEvento = (evento) => {
        if (!evento) return 'Fechas no disponibles';
        return formatRangoFechas(evento.fecha_inicio, evento.fecha_fin);
    };

    const tieneAsistenciaRegistradaHoy = (inscripcion) => {
        const hoy = new Date().toISOString().split('T')[0];
        if (asistenciasRegistradas.has(inscripcion.id)) return true;
        const asistencias = inscripcion.asistencias || [];
        return asistencias.some(a => a.fecha === hoy && a.estado === 'Presente');
    };

    const getEstadoVisual = (inscripcion) => {
        const hoy = new Date().toISOString().split('T')[0];
        const evento = inscripcion.evento;

        if (tieneAsistenciaRegistradaHoy(inscripcion)) return { texto: 'Registrado', puedeRegistrar: false };

        if (inscripcion.estado === 'Confirmada' && evento) {
            const dentroDelRango = hoy >= evento.fecha_inicio && hoy <= evento.fecha_fin;
            if (dentroDelRango) return { texto: 'Pendiente', puedeRegistrar: true };
            return { texto: hoy < evento.fecha_inicio ? 'No iniciado' : 'Finalizado', puedeRegistrar: false };
        }

        return { texto: inscripcion.estado || 'Pendiente', puedeRegistrar: false };
    };

    const getMensajeEstado = (estadoVisual) => {
        if (estadoVisual.texto === 'Registrado') return 'Asistencia ya registrada';
        if (estadoVisual.texto === 'Pendiente') return 'Puede registrar asistencia';
        if (estadoVisual.texto === 'No iniciado') return 'El evento aún no ha comenzado';
        if (estadoVisual.texto === 'Finalizado') return 'El evento ya finalizó';
        return `Estado: ${estadoVisual.texto}`;
    };

    const getAsistenciasDelEvento = (inscripcion) => {
        if (!inscripcion.asistencias || !Array.isArray(inscripcion.asistencias)) return [];
        return inscripcion.asistencias;
    };

    const formatFechaSegura = (fecha) => {
        if (!fecha) return 'Fecha no disponible';
        try { return formatFecha(fecha); } catch { return 'Fecha inválida'; }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Cargando mis inscripciones...</p>
            </div>
        );
    }

    if (!misInscripciones || misInscripciones.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <Calendar size={28} className="text-slate-400" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-700 mb-1">No tienes inscripciones activas</h3>
                    <p className="text-sm text-slate-500">Explora los eventos disponibles e inscríbete.</p>
                </div>
                <button onClick={onViewEvents}
                    className="h-9 px-5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors">
                    Ver eventos disponibles
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="mb-2">
                <h2 className="text-xl font-bold text-slate-800">Mis Inscripciones</h2>
                <p className="text-sm text-slate-500 mt-0.5">Gestiona tus inscripciones y registra tu asistencia a los eventos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {misInscripciones.map((inscripcion) => {
                    const evento = inscripcion.evento;
                    const estadoVisual = getEstadoVisual(inscripcion);
                    const asistencias = getAsistenciasDelEvento(inscripcion);
                    const estaRegistrando = registrandoAsistencia && inscripcionRegistrando === inscripcion.id;
                    const statusCls = STATUS_CLASSES[estadoVisual.texto] || 'bg-slate-100 text-slate-600 border border-slate-200';
                    const mensaje = getMensajeEstado(estadoVisual);
                    const msgCls = MSG_CLASSES[mensaje] || 'text-slate-500';

                    return (
                        <div key={inscripcion.id}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">

                            {/* Header */}
                            <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                                <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 flex-1">
                                    {evento?.titulo || 'Evento no disponible'}
                                </h3>
                                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${statusCls}`}>
                                    {estadoVisual.texto}
                                </span>
                            </div>

                            {/* Details */}
                            {evento && (
                                <div className="px-5 pb-3 space-y-2 flex-1">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar size={12} className="text-slate-400 shrink-0" />
                                        <span>{getRangoFechasEvento(evento)}{evento.hora && ` · ${formatHoraLocal(evento.hora)}`}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Hash size={12} className="text-slate-400 shrink-0" />
                                        <span className="font-mono">{inscripcion.codigo}</span>
                                    </div>

                                    {asistencias.length > 0 && (
                                        <div className="mt-2 bg-slate-50 rounded-lg p-3 space-y-1.5">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Asistencias registradas</p>
                                            {asistencias.map((asistencia, index) => (
                                                <div key={asistencia.id || index}
                                                    className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-600">{formatFechaSegura(asistencia.fecha)}</span>
                                                    <span className={`font-semibold ${asistencia.estado === 'Presente' ? 'text-emerald-600' : 'text-danger'}`}>
                                                        {asistencia.estado || 'Sin estado'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="px-5 pb-4 pt-1 flex flex-col gap-2">
                                {estadoVisual.puedeRegistrar ? (
                                    <button
                                        onClick={() => handleRegistrarAsistencia(inscripcion)}
                                        disabled={registrandoAsistencia}
                                        className="h-9 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-60">
                                        {estaRegistrando ? 'Registrando...' : 'Registrar Asistencia'}
                                    </button>
                                ) : (
                                    <div className={`flex items-center gap-1.5 text-xs font-medium ${msgCls}`}>
                                        {estadoVisual.texto === 'Registrado'
                                            ? <CheckCircle2 size={13} />
                                            : estadoVisual.texto === 'No iniciado'
                                                ? <Clock size={13} />
                                                : <AlertCircle size={13} />}
                                        {mensaje}
                                    </div>
                                )}

                                {puedeCancelar && puedeCancelar(inscripcion) && (
                                    <button
                                        onClick={() => handleCancelarInscripcion(inscripcion)}
                                        className="h-9 rounded-lg text-xs font-semibold bg-white text-danger border border-danger/30 hover:bg-danger/5 transition-colors">
                                        Cancelar inscripción
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InscriptionsList;
