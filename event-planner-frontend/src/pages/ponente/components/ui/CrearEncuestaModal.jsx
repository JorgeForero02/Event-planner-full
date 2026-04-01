import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { Button } from '../../../../components/ui/button';

const CrearEncuestaModal = ({
    eventoId,
    actividadId,
    onClose,
    onConfirm,
    eventos = [],
    encuestaEdit = null
}) => {
    const [formData, setFormData] = useState({
        titulo: '',
        tipo_encuesta: '',
        momento: '',
        url_google_form: '',
        url_respuestas: '',
        estado: 'borrador',
        fecha_inicio: '',
        fecha_fin: '',
        id_evento: eventoId || '',
        id_actividad: actividadId || '',
        obligatoria: false,
        descripcion: ''
    });

    const [errores, setErrores] = useState({});
    const [validando, setValidando] = useState(false);
    const [mostrarCamposOpcionales, setMostrarCamposOpcionales] = useState(false);

    // Tipos de encuesta (solo para actividades)
    const tiposEncuesta = [
        { value: 'pre_actividad', label: 'Pre-Actividad' },
        { value: 'durante_actividad', label: 'Durante Actividad' },
        { value: 'post_actividad', label: 'Post-Actividad' }
    ];

    // Momentos
    const momentos = [
        { value: 'antes', label: 'Antes' },
        { value: 'durante', label: 'Durante' },
        { value: 'despues', label: 'Después' }
    ];

    // Estados
    const estados = [
        { value: 'borrador', label: 'Borrador' },
        { value: 'activa', label: 'Activa' },
        { value: 'cerrada', label: 'Cerrada' }
    ];

    // Obtener actividades filtradas por el evento seleccionado
    const actividadesFiltradas = useMemo(() => {
        if (!formData.id_evento) return [];

        const eventoSeleccionado = eventos.find(e => e.id === formData.id_evento);
        console.log('🔍 Evento seleccionado:', eventoSeleccionado);
        console.log('🔍 Actividades del evento:', eventoSeleccionado?.actividades);

        if (!eventoSeleccionado || !eventoSeleccionado.actividades || eventoSeleccionado.actividades.length === 0) {
            console.log('⚠️ No hay actividades para este evento');
            return [];
        }

        // Formatear las actividades para tener el formato correcto
        return eventoSeleccionado.actividades.map(actividad => ({
            id_actividad: actividad.id_actividad || actividad.id,
            titulo: actividad.titulo,
            fecha_actividad: actividad.fecha_actividad,
            id_evento: eventoSeleccionado.id
        }));
    }, [formData.id_evento, eventos]);

    // Inicializar datos si es edición
    useEffect(() => {
        if (encuestaEdit) {
            console.log('📝 Editando encuesta:', encuestaEdit);
            setFormData({
                titulo: encuestaEdit.titulo || '',
                tipo_encuesta: encuestaEdit.tipo_encuesta || 'pre_actividad',
                momento: encuestaEdit.momento || 'antes',
                url_google_form: encuestaEdit.url_google_form || '',
                url_respuestas: encuestaEdit.url_respuestas || '',
                estado: encuestaEdit.estado || 'borrador',
                fecha_inicio: encuestaEdit.fecha_inicio || '',
                fecha_fin: encuestaEdit.fecha_fin || '',
                id_evento: encuestaEdit.id_evento || eventoId || '',
                id_actividad: encuestaEdit.id_actividad || actividadId || '',
                obligatoria: encuestaEdit.obligatoria || false,
                descripcion: encuestaEdit.descripcion || ''
            });
            setMostrarCamposOpcionales(true);
        } else if (eventoId || actividadId) {
            console.log('➕ Creando encuesta con IDs:', { eventoId, actividadId });
            // Si se pasa evento o actividad, llenar automáticamente
            setFormData(prev => ({
                ...prev,
                id_evento: eventoId || '',
                id_actividad: actividadId || '',
                tipo_encuesta: 'pre_actividad' // Valor por defecto
            }));
        } else {
            // Si es creación nueva, establecer valor por defecto para tipo_encuesta
            setFormData(prev => ({
                ...prev,
                tipo_encuesta: 'pre_actividad'
            }));
        }
    }, [encuestaEdit, eventoId, actividadId]);

    // Resetear actividad cuando cambia el evento (solo en creación)
    useEffect(() => {
        if (!encuestaEdit && formData.id_evento) {
            setFormData(prev => ({
                ...prev,
                id_actividad: ''
            }));
        }
    }, [formData.id_evento, encuestaEdit]);

    // Validar URL de Google Forms
    const validarGoogleFormURL = (url) => {
        const pattern = /^https:\/\/docs\.google\.com\/forms\/d\/e\/[A-Za-z0-9_-]+\/viewform$/;
        return pattern.test(url);
    };

    // Validar formulario
    const validarFormulario = () => {
        const nuevosErrores = {};

        // Título
        if (!formData.titulo.trim()) {
            nuevosErrores.titulo = 'El título es requerido';
        }

        // Evento
        if (!formData.id_evento) {
            nuevosErrores.id_evento = 'Debe seleccionar un evento';
        }

        // Actividad es obligatoria
        if (!formData.id_actividad) {
            nuevosErrores.id_actividad = 'Debe seleccionar una actividad';
        }

        // Tipo de encuesta
        if (!formData.tipo_encuesta) {
            nuevosErrores.tipo_encuesta = 'Debe seleccionar un tipo de encuesta';
        }

        // URL de Google Form
        if (!formData.url_google_form.trim()) {
            nuevosErrores.url_google_form = 'La URL del formulario es requerida';
        } else if (!validarGoogleFormURL(formData.url_google_form)) {
            nuevosErrores.url_google_form = 'URL de Google Forms inválida';
        }

        // Fechas
        if (formData.fecha_inicio && formData.fecha_fin) {
            const inicio = new Date(formData.fecha_inicio);
            const fin = new Date(formData.fecha_fin);

            if (fin < inicio) {
                nuevosErrores.fecha_fin = 'La fecha fin no puede ser anterior a la fecha inicio';
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        const newFormData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        };

        // Si cambia el evento, resetear actividad
        if (name === 'id_evento') {
            newFormData.id_actividad = '';
        }

        setFormData(newFormData);

        // Limpiar error del campo al editar
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        setValidando(true);
        try {
            // Preparar datos para enviar
            const datosEnviar = { ...formData };

            // Convertir IDs a números
            datosEnviar.id_evento = parseInt(datosEnviar.id_evento);

            if (datosEnviar.id_actividad) {
                datosEnviar.id_actividad = parseInt(datosEnviar.id_actividad);
            }

            // Limpiar campos vacíos opcionales
            if (!datosEnviar.url_respuestas) {
                delete datosEnviar.url_respuestas;
            }
            if (!datosEnviar.fecha_inicio) {
                delete datosEnviar.fecha_inicio;
            }
            if (!datosEnviar.fecha_fin) {
                delete datosEnviar.fecha_fin;
            }
            if (!datosEnviar.descripcion) {
                delete datosEnviar.descripcion;
            }

            console.log('📤 Enviando datos:', datosEnviar);
            const resultado = await onConfirm(datosEnviar);
            if (resultado) {
                onClose();
            }
        } catch (error) {
            console.error('Error al guardar encuesta:', error);
        } finally {
            setValidando(false);
        }
    };

    const getEventoSeleccionado = () => {
        return eventos.find(e => e.id === formData.id_evento);
    };

    const getActividadSeleccionada = () => {
        if (!formData.id_actividad) return null;
        return actividadesFiltradas.find(a => a.id_actividad === formData.id_actividad);
    };

    console.log('🔍 Estado actual:', {
        formData,
        actividadesFiltradas,
        eventoSeleccionado: getEventoSeleccionado(),
        actividadSeleccionada: getActividadSeleccionada()
    });

    return (
        <Dialog open={true} onOpenChange={(open) => !open && !validando && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {encuestaEdit ? 'Editar Encuesta' : 'Crear Nueva Encuesta'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700">
                            {encuestaEdit ? 'Información de la Encuesta' : 'Nueva Encuesta'}
                        </h3>

                        {/* Filtros de Evento y Actividad */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Evento *</Label>
                                <Select
                                    name="id_evento"
                                    value={formData.id_evento}
                                    onChange={handleChange}
                                    className={errores.id_evento ? 'border-danger' : ''}
                                >
                                    <option value="">Selecciona un evento</option>
                                    {eventos.map(evento => (
                                        <option key={evento.id} value={evento.id}>
                                            {evento.titulo} - {new Date(evento.fecha_inicio).toLocaleDateString()}
                                        </option>
                                    ))}
                                </Select>
                                {errores.id_evento && (
                                    <p className="text-sm text-danger">{errores.id_evento}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Actividad *</Label>
                                <Select
                                    name="id_actividad"
                                    value={formData.id_actividad || ''}
                                    onChange={handleChange}
                                    className={errores.id_actividad ? 'border-danger' : ''}
                                    disabled={!formData.id_evento}
                                >
                                    <option value="">Selecciona una actividad</option>
                                    {actividadesFiltradas.map(actividad => (
                                        <option key={actividad.id_actividad} value={actividad.id_actividad}>
                                            {actividad.titulo} - {new Date(actividad.fecha_actividad).toLocaleDateString()}
                                        </option>
                                    ))}
                                </Select>
                                {errores.id_actividad ? (
                                    <p className="text-sm text-danger">{errores.id_actividad}</p>
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        {!formData.id_evento
                                            ? 'Selecciona un evento primero'
                                            : actividadesFiltradas.length === 0
                                                ? 'Este evento no tiene actividades'
                                                : 'Selecciona una actividad para la encuesta'
                                        }
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Información de la selección */}
                        {(formData.id_evento || formData.id_actividad) && (
                            <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                                {getEventoSeleccionado() && (
                                    <p>
                                        <span className="text-slate-500">Evento seleccionado:</span>{' '}
                                        <span className="font-medium">{getEventoSeleccionado().titulo}</span>
                                    </p>
                                )}
                                {formData.id_actividad && getActividadSeleccionada() && (
                                    <p>
                                        <span className="text-slate-500">Actividad seleccionada:</span>{' '}
                                        <span className="font-medium">{getActividadSeleccionada().titulo}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Título */}
                        <div className="space-y-2">
                            <Label>Título de la encuesta *</Label>
                            <Input
                                type="text"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                className={errores.titulo ? 'border-danger' : ''}
                                maxLength="200"
                            />
                            {errores.titulo && (
                                <p className="text-sm text-danger">{errores.titulo}</p>
                            )}
                        </div>

                        {/* Tipo y Momento */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de encuesta *</Label>
                                <Select
                                    name="tipo_encuesta"
                                    value={formData.tipo_encuesta}
                                    onChange={handleChange}
                                    className={errores.tipo_encuesta ? 'border-danger' : ''}
                                >
                                    <option value="">Selecciona un tipo</option>
                                    {tiposEncuesta.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </option>
                                    ))}
                                </Select>
                                {errores.tipo_encuesta && (
                                    <p className="text-sm text-danger">{errores.tipo_encuesta}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Momento *</Label>
                                <Select
                                    name="momento"
                                    value={formData.momento}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecciona un momento</option>
                                    {momentos.map(momento => (
                                        <option key={momento.value} value={momento.value}>
                                            {momento.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* URL Google Form */}
                        <div className="space-y-2">
                            <Label>URL de Google Forms *</Label>
                            <Input
                                type="url"
                                name="url_google_form"
                                value={formData.url_google_form}
                                onChange={handleChange}
                                className={errores.url_google_form ? 'border-danger' : ''}
                                placeholder="https://docs.google.com/forms/d/e/{FORM_ID}/viewform"
                            />
                            {errores.url_google_form ? (
                                <p className="text-sm text-danger">{errores.url_google_form}</p>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    Formato requerido: https://docs.google.com/forms/d/e/ID_FORMULARIO/viewform
                                </p>
                            )}
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Describe el propósito de esta encuesta..."
                                rows="3"
                            />
                        </div>

                        {/* Campos opcionales */}
                        <button
                            type="button"
                            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
                            onClick={() => setMostrarCamposOpcionales(!mostrarCamposOpcionales)}
                        >
                            {mostrarCamposOpcionales ? 'Ocultar' : 'Mostrar'} campos opcionales
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                style={{ transform: mostrarCamposOpcionales ? 'rotate(180deg)' : 'none' }}>
                                <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {mostrarCamposOpcionales && (
                            <div className="space-y-4">
                                {/* URL de respuestas */}
                                <div className="space-y-2">
                                    <Label>URL de Google Sheets (Respuestas)</Label>
                                    <Input
                                        type="url"
                                        name="url_respuestas"
                                        value={formData.url_respuestas}
                                        onChange={handleChange}
                                        placeholder="https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit"
                                    />
                                    <p className="text-sm text-slate-500">
                                        Opcional - URL donde se almacenan las respuestas
                                    </p>
                                </div>

                                {/* Estado */}
                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <Select
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                    >
                                        {estados.map(estado => (
                                            <option key={estado.value} value={estado.value}>
                                                {estado.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                {/* Fechas */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Fecha de inicio</Label>
                                        <Input
                                            type="date"
                                            name="fecha_inicio"
                                            value={formData.fecha_inicio}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Fecha de fin</Label>
                                        <Input
                                            type="date"
                                            name="fecha_fin"
                                            value={formData.fecha_fin}
                                            onChange={handleChange}
                                            className={errores.fecha_fin ? 'border-danger' : ''}
                                        />
                                        {errores.fecha_fin && (
                                            <p className="text-sm text-danger">{errores.fecha_fin}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Obligatoria */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="obligatoria"
                                            checked={formData.obligatoria}
                                            onChange={handleChange}
                                            className="h-4 w-4 rounded border-slate-300 accent-brand-600"
                                        />
                                        Encuesta obligatoria
                                    </label>
                                    <p className="text-sm text-slate-500">
                                        Los asistentes deberán completar esta encuesta
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={validando}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={validando}
                        >
                            {validando
                                ? (encuestaEdit ? 'Actualizando...' : 'Creando...')
                                : (encuestaEdit ? 'Actualizar Encuesta' : 'Crear Encuesta')
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CrearEncuestaModal;
