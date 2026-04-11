import React, { useState } from "react";
import {
    Calendar,
    Building2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Save,
    MapPin,
    Link as LinkIcon,
    Sparkles,
    Info,
} from "lucide-react";

import Sidebar from "../Sidebar";
import { useEvento } from "../../../components/useCrearEvento";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import IAAsistente from "../../../components/IAAsistente";

/** Tooltip de ayuda inline — aparece al pasar el cursor por el ícono ⓘ */
const FieldTip = ({ children }) => (
    <span className="relative group ml-1.5 inline-flex items-center align-middle">
        <Info size={13} className="text-slate-400 hover:text-brand-600 cursor-help transition-colors" />
        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-lg bg-slate-800 px-3 py-2 text-xs leading-relaxed text-white opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-xl">
            {children}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </span>
    </span>
);

const CrearEventoPage = () => {
    const {
        empresa,
        formData,
        handleInputChange,
        handleSubmit,
        mensaje,
        loading,
        enviando,
        mostrarModalExito,
        handleCerrarModal,
        handleVolver,
        lugaresEmpresa,
        obtenerCapacidadLugar,
        errorCupos,
    } = useEvento(null);

    const mostrarSala = formData.modalidad === 'Presencial' || formData.modalidad === 'Híbrida';
    const mostrarUrl  = formData.modalidad === 'Virtual'    || formData.modalidad === 'Híbrida';

    const [mostrarIA, setMostrarIA] = useState(false);

    const handleAplicarIA = (estructura) => {
        if (estructura.evento) {
            const ev = estructura.evento;
            if (ev.titulo) handleInputChange('titulo', ev.titulo);
            if (ev.descripcion) handleInputChange('descripcion', ev.descripcion);
            if (ev.modalidad) handleInputChange('modalidad', ev.modalidad);
            if (ev.fecha_inicio) handleInputChange('fecha_inicio', ev.fecha_inicio);
            if (ev.fecha_fin) handleInputChange('fecha_fin', ev.fecha_fin);
            if (ev.hora) handleInputChange('hora', ev.hora);
            if (ev.cupos) handleInputChange('cupos', String(ev.cupos));
        }
        setMostrarIA(false);
    };

    const handleHoraInicio = (value) => {
        handleInputChange("hora", value);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center gap-3 ml-[280px]">
                    <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
                    <p className="text-slate-500 text-sm">Cargando información...</p>
                </div>
            </div>
        );
    }

    if (!empresa) {
        return (
            <div className="flex min-h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center p-6 ml-[280px]">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-10 max-w-md w-full text-center space-y-4">
                        <AlertCircle size={64} className="mx-auto text-rose-500" />
                        <h2 className="text-xl font-semibold text-slate-800">Error al Cargar Información</h2>
                        <p className="text-slate-500 text-sm">No se pudo obtener la información de tu empresa.</p>

                        {mensaje?.texto && (
                            <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{mensaje.texto}</span>
                            </div>
                        )}

                        <div className="flex justify-center gap-3 pt-2">
                            <Button variant="outline" onClick={handleVolver}>Volver</Button>
                            <Button onClick={() => window.location.reload()}>Reintentar</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const fixDate = (dateString) => {
        if (!dateString) return "";

        if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const date = new Date(dateString + 'T00:00:00');

            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        }

        if (typeof dateString === 'string' && dateString.includes('T')) {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";

            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        }

        return "";
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />

            <div className="flex-1 overflow-auto p-6 ml-[280px]">
                <div className="max-w-2xl mx-auto">

                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleVolver}
                            className="rounded-lg p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            aria-label="Volver"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Calendar size={24} className="text-brand-600" />
                            <h1 className="text-xl font-semibold text-slate-800">Crear Nuevo Evento</h1>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMostrarIA(true)}
                        className="gap-1.5 text-brand-600 border-brand-200 hover:bg-brand-50 shrink-0"
                    >
                        <Sparkles size={15} />
                        Planificar con IA
                    </Button>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 bg-brand-50 border border-brand-100 rounded-lg px-4 py-3 mb-6">
                    <Building2 size={16} className="text-brand-600 shrink-0" />
                    <span>
                        Organizando para: <strong className="text-slate-800">{empresa.nombre}</strong>
                    </span>
                </div>

                {mensaje?.texto && (
                    <Alert variant={mensaje.tipo === 'exito' ? 'default' : 'destructive'} className="mb-6">
                        {mensaje.tipo === 'exito'
                            ? <CheckCircle2 size={16} />
                            : <AlertCircle size={16} />
                        }
                        <AlertDescription>{mensaje.texto}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-5">

                    {/* TÍTULO */}
                    <div className="space-y-1.5">
                        <Label htmlFor="crear-titulo">
                            Nombre del Evento *
                            <FieldTip>El nombre público que verán los asistentes al buscar o inscribirse al evento. Sé descriptivo y conciso.</FieldTip>
                        </Label>
                        <Input
                            id="crear-titulo"
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => handleInputChange("titulo", e.target.value)}
                            placeholder="Ej: Conferencia Internacional de Innovación 2026"
                            required
                        />
                    </div>

                    {/* MODALIDAD */}
                    <div className="space-y-1.5">
                        <Label htmlFor="crear-modalidad">
                            Modalidad *
                            <FieldTip>
                                <strong>Presencial:</strong> los asistentes asisten físicamente a un lugar.<br />
                                <strong>Virtual:</strong> se realiza completamente en línea (requiere URL de reunión).<br />
                                <strong>Híbrida:</strong> combina asistentes presenciales y virtuales.
                            </FieldTip>
                        </Label>
                        <select
                            id="crear-modalidad"
                            value={formData.modalidad}
                            onChange={(e) => handleInputChange("modalidad", e.target.value)}
                            className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500"
                        >
                            <option value="Presencial">Presencial</option>
                            <option value="Virtual">Virtual</option>
                            <option value="Híbrida">Híbrida</option>
                        </select>
                    </div>

                    {/* FECHAS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="crear-fecha-inicio">
                                Fecha de Inicio *
                                <FieldTip>El primer día del evento. Si el evento dura un solo día, esta fecha debe coincidir con la fecha de fin.</FieldTip>
                            </Label>
                            <Input
                                id="crear-fecha-inicio"
                                type="date"
                                value={fixDate(formData.fecha_inicio)}
                                onChange={(e) => handleInputChange("fecha_inicio", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="crear-fecha-fin">
                                Fecha de Fin *
                                <FieldTip>El último día del evento. Debe ser igual o posterior a la fecha de inicio.</FieldTip>
                            </Label>
                            <Input
                                id="crear-fecha-fin"
                                type="date"
                                value={fixDate(formData.fecha_fin)}
                                onChange={(e) => handleInputChange("fecha_fin", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* HORA */}
                    <div className="space-y-1.5">
                        <Label htmlFor="crear-hora">
                            Hora de Inicio *
                            <FieldTip>La hora a la que comenzará el evento el primer día. Usa formato de 24 horas.</FieldTip>
                        </Label>
                        <Input
                            id="crear-hora"
                            type="time"
                            value={formData.hora || ""}
                            onChange={(e) => handleHoraInicio(e.target.value)}
                            required
                        />
                    </div>

                    {/* FECHA LÍMITE CANCELACIÓN */}
                    <div className="space-y-1.5">
                        <Label htmlFor="crear-fecha-limite">
                            Fecha Límite de Cancelación
                            <FieldTip>Hasta esta fecha los asistentes podrán cancelar su inscripción. Debe ser anterior o igual a la fecha de inicio. Es obligatoria cuando el evento está en estado Publicado.</FieldTip>
                        </Label>
                        <Input
                            id="crear-fecha-limite"
                            type="date"
                            value={formData.fecha_limite_cancelacion || ''}
                            onChange={(e) => handleInputChange('fecha_limite_cancelacion', e.target.value)}
                            max={formData.fecha_inicio || undefined}
                        />
                        <p className="text-xs text-slate-500">Opcional en borrador · Obligatoria al publicar el evento</p>
                    </div>

                    {/* SALA */}
                    {mostrarSala && (
                        <div className="space-y-1.5">
                            <Label htmlFor="crear-sala" className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-slate-500" />
                                Sala / Lugar *
                                <FieldTip>Selecciona el espacio físico donde se realizará el evento. Los cupos disponibles no pueden superar la capacidad máxima de la sala.</FieldTip>
                            </Label>
                            <select
                                id="crear-sala"
                                value={formData.lugar_id || ''}
                                onChange={(e) => handleInputChange('lugar_id', e.target.value ? Number(e.target.value) : '')}
                                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500"
                            >
                                <option value="">-- Selecciona una sala --</option>
                                {lugaresEmpresa.map(l => (
                                    <option key={l.id} value={l.id}>
                                        {l.nombre}{l.capacidad ? ` (cap. ${l.capacidad})` : ''}
                                    </option>
                                ))}
                            </select>
                            {formData.lugar_id && obtenerCapacidadLugar && obtenerCapacidadLugar(formData.lugar_id) && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Capacidad máxima de esta sala: <strong>{obtenerCapacidadLugar(formData.lugar_id)}</strong> personas
                                </p>
                            )}
                        </div>
                    )}

                    {/* URL VIRTUAL */}
                    {mostrarUrl && (
                        <div className="space-y-1.5">
                            <Label htmlFor="crear-url-virtual" className="flex items-center gap-1.5">
                                <LinkIcon size={14} className="text-slate-500" />
                                URL de reunión virtual *
                                <FieldTip>Enlace de la videollamada que recibirán los participantes. Puede ser Google Meet, Zoom, Microsoft Teams u otra plataforma.</FieldTip>
                            </Label>
                            <Input
                                id="crear-url-virtual"
                                type="url"
                                value={formData.url_virtual || ''}
                                onChange={(e) => handleInputChange('url_virtual', e.target.value)}
                                placeholder="https://meet.google.com/..."
                            />
                            <p className="text-xs text-slate-500">Ej: https://zoom.us/j/123456 · https://meet.google.com/abc-xyz</p>
                        </div>
                    )}

                    {/* CUPOS */}
                    <div className="space-y-1.5">
                        <Label htmlFor="crear-cupos">
                            Cupos
                            <FieldTip>Número máximo de asistentes que pueden inscribirse. Si seleccionaste una sala, no puede superar su capacidad máxima. Deja vacío para cupos ilimitados.</FieldTip>
                        </Label>
                        <Input
                            id="crear-cupos"
                            type="number"
                            min="0"
                            max={obtenerCapacidadLugar && formData.lugar_id ? (obtenerCapacidadLugar(formData.lugar_id) ?? undefined) : undefined}
                            value={formData.cupos || ""}
                            onChange={(e) => handleInputChange("cupos", e.target.value)}
                            placeholder="Ej: 100"
                            className={errorCupos?.mostrar ? 'border-rose-400' : ''}
                        />
                        {errorCupos?.mostrar ? (
                            <p className="text-xs text-rose-600">{errorCupos.mensaje}</p>
                        ) : (
                            <p className="text-xs text-slate-500">Deja en blanco para no limitar el número de participantes</p>
                        )}
                    </div>

                    {/* DESCRIPCIÓN */}
                    <div className="space-y-1.5">
                        <Label htmlFor="crear-descripcion">
                            Descripción
                            <FieldTip>Información general del evento: objetivos, programa, público al que va dirigido, etc. Esta descripción es visible para todos los asistentes potenciales.</FieldTip>
                        </Label>
                        <textarea
                            id="crear-descripcion"
                            value={formData.descripcion}
                            onChange={(e) => handleInputChange("descripcion", e.target.value)}
                            rows={5}
                            placeholder="Describe el evento, sus objetivos, a quién va dirigido..."
                            className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500 resize-y"
                        />
                        <p className="text-xs text-slate-500">Visible para los asistentes en el catálogo de eventos</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={handleVolver}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={enviando} className="gap-2">
                            <Save size={16} />
                            {enviando ? "Creando..." : "Crear Evento"}
                        </Button>
                    </div>
                </form>
            </div>
            </div>

            {mostrarModalExito && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-modal p-8 max-w-sm w-full mx-4 text-center space-y-4">
                        <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
                        <h2 className="text-xl font-semibold text-slate-800">¡Evento creado exitosamente!</h2>
                        <Button onClick={handleCerrarModal} className="w-full">Aceptar</Button>
                    </div>
                </div>
            )}

            {mostrarIA && (
                <IAAsistente
                    modo="evento"
                    contexto={{
                        titulo: formData.titulo,
                        modalidad: formData.modalidad,
                        fecha_inicio: formData.fecha_inicio,
                        fecha_fin: formData.fecha_fin,
                    }}
                    onAplicar={handleAplicarIA}
                    onCerrar={() => setMostrarIA(false)}
                />
            )}
        </div>
    );
};

export default CrearEventoPage;
