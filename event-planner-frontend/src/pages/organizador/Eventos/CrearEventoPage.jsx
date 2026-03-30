import React from "react";
import {
    Calendar,
    Building2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Save,
} from "lucide-react";

import Sidebar from "../Sidebar";
import { useEvento } from "../../../components/useCrearEvento";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { cn } from "../../../lib/utils";

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
    } = useEvento(null);

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

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
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

                {/* Empresa info */}
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-brand-50 border border-brand-100 rounded-lg px-4 py-3 mb-6">
                    <Building2 size={16} className="text-brand-600 shrink-0" />
                    <span>
                        Organizando para: <strong className="text-slate-800">{empresa.nombre}</strong>
                    </span>
                </div>

                {/* Alert message */}
                {mensaje?.texto && (
                    <Alert variant={mensaje.tipo === 'exito' ? 'default' : 'destructive'} className="mb-6">
                        {mensaje.tipo === 'exito'
                            ? <CheckCircle2 size={16} />
                            : <AlertCircle size={16} />
                        }
                        <AlertDescription>{mensaje.texto}</AlertDescription>
                    </Alert>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-5">

                    <div className="space-y-1.5">
                        <Label htmlFor="crear-titulo">Nombre del Evento *</Label>
                        <Input
                            id="crear-titulo"
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => handleInputChange("titulo", e.target.value)}
                            placeholder="Ej: Conferencia 2025"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="crear-modalidad">Modalidad *</Label>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="crear-fecha-inicio">Fecha de Inicio *</Label>
                            <Input
                                id="crear-fecha-inicio"
                                type="date"
                                value={fixDate(formData.fecha_inicio)}
                                onChange={(e) => handleInputChange("fecha_inicio", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="crear-fecha-fin">Fecha de Fin *</Label>
                            <Input
                                id="crear-fecha-fin"
                                type="date"
                                value={fixDate(formData.fecha_fin)}
                                onChange={(e) => handleInputChange("fecha_fin", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="crear-hora">Hora de Inicio *</Label>
                        <Input
                            id="crear-hora"
                            type="time"
                            value={formData.hora || ""}
                            onChange={(e) => handleHoraInicio(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="crear-cupos">Cupos</Label>
                        <Input
                            id="crear-cupos"
                            type="number"
                            min="0"
                            value={formData.cupos || ""}
                            onChange={(e) => handleInputChange("cupos", e.target.value)}
                            placeholder="Ej: 100"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="crear-descripcion">Descripción Adicional</Label>
                        <textarea
                            id="crear-descripcion"
                            value={formData.descripcion}
                            onChange={(e) => handleInputChange("descripcion", e.target.value)}
                            rows={5}
                            className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500 resize-y"
                        />
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

            {/* Modal Éxito */}
            {mostrarModalExito && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-modal p-8 max-w-sm w-full mx-4 text-center space-y-4">
                        <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
                        <h2 className="text-xl font-semibold text-slate-800">¡Evento creado exitosamente!</h2>
                        <Button onClick={handleCerrarModal} className="w-full">Aceptar</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrearEventoPage;
