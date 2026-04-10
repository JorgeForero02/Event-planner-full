import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Calendar,
    ArrowLeft,
    Save,
    AlertCircle,
    Building2,
    CheckCircle2,
    XCircle,
    MapPin,
    Link as LinkIcon,
    Sparkles,
    Loader2,
} from 'lucide-react';
import { generarDescripcion } from '../../../services/iaService';
import { useEvento } from '../../../components/useCrearEvento';
import Sidebar from '../Sidebar';
import { Dialog, DialogContent, DialogFooter } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';

const ESTADOS = [
    { value: 0, label: 'Borrador' },
    { value: 1, label: 'Publicado' },
    { value: 2, label: 'Cancelado' },
    { value: 3, label: 'Finalizado' }
];

const EditarEventoPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const backPath = location.pathname.startsWith('/gerente') ? '/gerente/eventos' : '/organizador';

    const {
        cargando,
        guardando,
        error,
        mensaje,
        mostrarModalExito,
        mostrarModalError,
        empresa,
        formData,
        handleInputChange,
        guardarEvento,
        setMostrarModalError,
        setMostrarModalExito,
        errorCupos,
        lugaresEmpresa,
    } = useEvento(id);

    const mostrarSala = formData.modalidad === 'Presencial' || formData.modalidad === 'Híbrida';
    const mostrarUrl  = formData.modalidad === 'Virtual'    || formData.modalidad === 'Híbrida';

    const [iaPanel, setIaPanel] = useState(false);
    const [iaTono, setIaTono] = useState('formal');
    const [iaLoading, setIaLoading] = useState(false);
    const [iaTexto, setIaTexto] = useState('');
    const [iaError, setIaError] = useState('');

    const handleGenerarDescripcion = async () => {
        setIaLoading(true);
        setIaError('');
        setIaTexto('');
        try {
            const texto = await generarDescripcion(id, iaTono);
            setIaTexto(texto);
        } catch (err) {
            setIaError(err.message || 'Error al generar descripción');
        }
        setIaLoading(false);
    };
    useEffect(() => {
        if (mostrarModalExito) {
            const timer = setTimeout(() => {
                setMostrarModalExito(false);
                navigate(backPath);
            }, 2000);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mostrarModalExito, navigate, setMostrarModalExito]);

    if (cargando) {
        return (
            <div className="flex min-h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center gap-3 ml-[280px]">
                    <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
                    <p className="text-slate-500 text-sm">Cargando evento...</p>
                </div>
            </div>
        );
    }

    if (error && !empresa) {
        return (
            <div className="flex min-h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center p-6 ml-[280px]">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center space-y-4">
                        <AlertCircle size={64} className="mx-auto text-rose-500" />
                        <h2 className="text-xl font-semibold text-slate-800">Error al Cargar Evento</h2>
                        <p className="text-slate-500 text-sm">{error}</p>
                        <div className="flex justify-center gap-3 pt-2">
                            <Button variant="outline" onClick={() => navigate(backPath)}>Volver</Button>
                            <Button onClick={() => window.location.reload()}>Reintentar</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />

            <div className="flex-1 overflow-auto p-6 ml-[280px]">
                <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate(backPath)}
                        className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-tight">Editar Evento</h1>
                        {empresa && (
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                                <Building2 size={13} />
                                {empresa.nombre}
                            </p>
                        )}
                    </div>
                </div>

                {/* Alert messages */}
                {mensaje?.texto && (
                    <Alert variant={mensaje.tipo === 'error' ? 'destructive' : 'default'} className="mb-4">
                        <AlertCircle size={16} />
                        <AlertDescription>{mensaje.texto}</AlertDescription>
                    </Alert>
                )}

                {errorCupos?.mostrar && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle size={16} />
                        <AlertDescription>{errorCupos.mensaje}</AlertDescription>
                    </Alert>
                )}

                <form
                    onSubmit={(e) => { e.preventDefault(); guardarEvento(); }}
                    className="space-y-6"
                >
                    {/* Card: Información básica */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2">Información Básica</h2>

                        <div className="space-y-1.5">
                            <Label htmlFor="editar-titulo">Nombre del Evento *</Label>
                            <Input
                                id="editar-titulo"
                                type="text"
                                value={formData.titulo}
                                onChange={(e) => handleInputChange('titulo', e.target.value)}
                                placeholder="Ej: Conferencia Anual de Tecnología 2025"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="editar-fecha-inicio" className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-slate-500" /> Fecha de Inicio *
                                </Label>
                                <Input
                                    id="editar-fecha-inicio"
                                    type="date"
                                    value={formData.fecha_inicio}
                                    onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="editar-hora">Hora de Inicio *</Label>
                                <Input
                                    id="editar-hora"
                                    type="time"
                                    value={formData.hora}
                                    onChange={(e) => handleInputChange('hora', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="editar-fecha-fin" className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-slate-500" /> Fecha de Fin *
                            </Label>
                            <Input
                                id="editar-fecha-fin"
                                type="date"
                                value={formData.fecha_fin}
                                onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="editar-fecha-limite">
                                Fecha Límite de Cancelación
                                {Number(formData.estado) === 1 && <span className="text-rose-500 ml-1">*</span>}
                            </Label>
                            <Input
                                id="editar-fecha-limite"
                                type="date"
                                value={formData.fecha_limite_cancelacion || ''}
                                onChange={(e) => handleInputChange('fecha_limite_cancelacion', e.target.value)}
                                max={formData.fecha_inicio || undefined}
                            />
                            <p className="text-xs text-slate-500">Debe ser anterior o igual a la fecha de inicio. Obligatoria al publicar.</p>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="editar-estado">Estado del Evento</Label>
                            <select
                                id="editar-estado"
                                value={formData.estado}
                                onChange={(e) => handleInputChange('estado', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                {ESTADOS.map((e) => (
                                    <option key={e.value} value={e.value}>{e.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="editar-modalidad">Modalidad</Label>
                            <select
                                id="editar-modalidad"
                                value={formData.modalidad || 'Presencial'}
                                onChange={(e) => handleInputChange('modalidad', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="Presencial">Presencial</option>
                                <option value="Virtual">Virtual</option>
                                <option value="Híbrida">Híbrida</option>
                            </select>
                        </div>

                        {mostrarSala && (
                            <div className="space-y-1.5">
                                <Label htmlFor="editar-sala" className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-slate-500" /> Sala / Lugar *
                                </Label>
                                <select
                                    id="editar-sala"
                                    value={formData.lugar_id || ''}
                                    onChange={(e) => handleInputChange('lugar_id', e.target.value ? Number(e.target.value) : '')}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="">-- Selecciona una sala --</option>
                                    {(lugaresEmpresa || []).map(l => (
                                        <option key={l.id} value={l.id}>
                                            {l.nombre}{l.capacidad ? ` (cap. ${l.capacidad})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {mostrarUrl && (
                            <div className="space-y-1.5">
                                <Label htmlFor="editar-url" className="flex items-center gap-1.5">
                                    <LinkIcon size={14} className="text-slate-500" /> URL de reunión virtual *
                                </Label>
                                <Input
                                    id="editar-url"
                                    type="url"
                                    value={formData.url_virtual || ''}
                                    onChange={(e) => handleInputChange('url_virtual', e.target.value)}
                                    placeholder="https://meet.google.com/..."
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="editar-cupos">Cupos *</Label>
                            <Input
                                id="editar-cupos"
                                type="number"
                                min={0}
                                value={formData.cupos ?? ''}
                                onChange={(e) => handleInputChange('cupos', e.target.value)}
                                placeholder="Ej: 50"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="editar-descripcion">Descripción</Label>
                                <button
                                    type="button"
                                    onClick={() => { setIaPanel(v => !v); setIaTexto(''); setIaError(''); }}
                                    className="flex items-center gap-1 text-xs text-brand-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                    <Sparkles size={13} />
                                    Generar con IA
                                </button>
                            </div>
                            <Textarea
                                id="editar-descripcion"
                                value={formData.descripcion ?? ''}
                                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                rows={3}
                            />
                            {iaPanel && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
                                    <p className="text-xs font-medium text-blue-800">Generar descripción automáticamente</p>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={iaTono}
                                            onChange={(e) => setIaTono(e.target.value)}
                                            className="flex-1 h-8 rounded-md border border-input bg-white px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="formal">Formal y profesional</option>
                                            <option value="amigable">Amigable y cercano</option>
                                            <option value="motivador">Motivador e inspirador</option>
                                        </select>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleGenerarDescripcion}
                                            disabled={iaLoading}
                                            className="gap-1 h-8 text-xs"
                                        >
                                            {iaLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                            {iaLoading ? 'Generando...' : 'Generar'}
                                        </Button>
                                    </div>
                                    {iaError && <p className="text-xs text-danger">{iaError}</p>}
                                    {iaTexto && (
                                        <div className="space-y-1.5">
                                            <Textarea
                                                value={iaTexto}
                                                onChange={(e) => setIaTexto(e.target.value)}
                                                rows={4}
                                                className="text-xs bg-white"
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="w-full h-7 text-xs"
                                                onClick={() => {
                                                    handleInputChange('descripcion', iaTexto);
                                                    setIaPanel(false);
                                                    setIaTexto('');
                                                }}
                                            >
                                                Insertar en descripción
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pb-6">
                        <Button type="button" variant="outline" onClick={() => navigate(backPath)} disabled={guardando}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={guardando || errorCupos?.mostrar} className="gap-2">
                            <Save size={16} />
                            {guardando ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
                </div>
            </div>

            {/* Modal éxito */}
            <Dialog open={mostrarModalExito}>
                <DialogContent className="max-w-sm text-center">
                    <div className="flex flex-col items-center gap-3 py-4">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                        <h2 className="text-lg font-semibold text-slate-800">¡Evento actualizado!</h2>
                        <p className="text-sm text-slate-500">Redirigiendo...</p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal error */}
            <Dialog open={mostrarModalError} onOpenChange={(open) => !open && setMostrarModalError(false)}>
                <DialogContent className="max-w-sm">
                    <div className="flex flex-col items-center gap-3 py-4 text-center">
                        <XCircle size={48} className="text-rose-500" />
                        <h2 className="text-lg font-semibold text-slate-800">Error al guardar</h2>
                        <p className="text-sm text-slate-600">{errorCupos?.mensaje || ''}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => setMostrarModalError(false)} className="w-full">
                            Entendido
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EditarEventoPage;
