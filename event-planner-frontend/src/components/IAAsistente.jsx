import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { planificarConIA } from '../services/iaService';

/**
 * IAAsistente — panel de chat deslizable para planificación de eventos y agenda con IA.
 *
 * Props:
 *  modo        'evento' | 'agenda'
 *  contexto    objeto con datos actuales del formulario (titulo, fechas, modalidad, etc.)
 *  onAplicar   callback(estructura) — se llama cuando el usuario confirma la propuesta
 *  onCerrar    callback() — cierra el panel
 */
const IAAsistente = ({ modo = 'evento', contexto = {}, onAplicar, onCerrar }) => {
    const mensajeInicial =
        modo === 'evento'
            ? '¡Hola! Soy tu asistente de planificación de eventos. Descríbeme qué tipo de evento quieres organizar — tema, duración, número de asistentes, actividades clave — y crearé un plan completo listo para aplicar al formulario.'
            : '¡Hola! Soy tu asistente de agenda. Descríbeme las actividades que necesitas para este evento e indicaré descripción, fechas y horarios sugeridos para cada una.';

    const [mensajes, setMensajes] = useState([{ rol: 'assistant', contenido: mensajeInicial }]);
    const [input, setInput] = useState('');
    const [cargando, setCargando] = useState(false);
    const [propuesta, setPropuesta] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [aplicando, setAplicando] = useState(false);
    const chatRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        document.body.classList.add('ia-asistente-open');
        return () => document.body.classList.remove('ia-asistente-open');
    }, []);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [mensajes, cargando]);

    useEffect(() => {
        if (!cargando && inputRef.current) {
            inputRef.current.focus();
        }
    }, [cargando]);

    const enviar = async () => {
        if (!input.trim() || cargando) return;
        const msgTexto = input.trim();
        setInput('');

        const userMsg = { rol: 'user', contenido: msgTexto };
        setMensajes(prev => [...prev, userMsg]);
        setCargando(true);

        const nuevoHistorial = [...historial, { rol: 'user', contenido: msgTexto }];

        try {
            const resultado = await planificarConIA(msgTexto, historial, { tipo: modo, datos: contexto });
            const respTxt = resultado.mensaje || 'Propuesta generada.';
            setMensajes(prev => [...prev, { rol: 'assistant', contenido: respTxt }]);
            setHistorial([...nuevoHistorial, { rol: 'assistant', contenido: respTxt }]);
            if (resultado.estructura) setPropuesta(resultado.estructura);
        } catch (err) {
            const errMsg = err.message?.includes('503') || err.message?.includes('disponible')
                ? 'El servicio de IA no está disponible en este momento. Verifica la configuración de la API key.'
                : 'Hubo un error al conectar con el asistente. Por favor intenta de nuevo.';
            setMensajes(prev => [...prev, { rol: 'assistant', contenido: errMsg }]);
            setHistorial(nuevoHistorial);
        } finally {
            setCargando(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviar();
        }
    };

    const limpiarPropuesta = () => setPropuesta(null);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onCerrar}
                aria-hidden="true"
            />

            {/* Panel */}
            <div className="relative h-full w-full max-w-[440px] bg-white shadow-2xl flex flex-col">

                {/* Loading overlay — cubre todo el panel cuando la IA está generando */}
                {cargando && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-white/85 backdrop-blur-sm rounded-none">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles size={20} className="text-brand-600" />
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-semibold text-slate-700">La IA está pensando...</p>
                            <p className="text-xs text-slate-400">Esto puede tomar unos segundos</p>
                        </div>
                        <div className="flex gap-1.5">
                            {[0, 150, 300].map(delay => (
                                <span key={delay} className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-brand-600 text-white shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <Sparkles size={16} />
                        </div>
                        <div>
                            <p className="font-semibold text-sm leading-tight">Asistente IA</p>
                            <p className="text-xs text-blue-100 leading-tight">
                                {modo === 'evento' ? 'Planificación de evento' : 'Planificación de agenda'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCerrar}
                        className="rounded-full p-1.5 hover:bg-white/20 transition-colors"
                        aria-label="Cerrar asistente"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Chat messages */}
                <div
                    ref={chatRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-0"
                >
                    {mensajes.map((m, i) => (
                        <div
                            key={i}
                            className={`flex items-end gap-2 ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {m.rol === 'assistant' && (
                                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                                    <Sparkles size={12} className="text-white" />
                                </div>
                            )}
                            <div
                                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                    m.rol === 'user'
                                        ? 'bg-brand-600 text-white rounded-br-sm'
                                        : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm'
                                }`}
                            >
                                <p className="whitespace-pre-wrap">{m.contenido}</p>
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {cargando && (
                        <div className="flex items-end gap-2 justify-start">
                            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                                <Sparkles size={12} className="text-white" />
                            </div>
                            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-slate-100">
                                <div className="flex gap-1 items-center h-4">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Proposal card */}
                {propuesta && (
                    <div className="border-t border-slate-200 bg-emerald-50 shrink-0 max-h-[46%] overflow-y-auto">
                        <div className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle size={15} className="text-emerald-600" />
                                <span className="text-sm font-semibold text-emerald-700">Propuesta lista</span>
                                <button
                                    onClick={limpiarPropuesta}
                                    className="ml-auto text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label="Descartar propuesta"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Event summary */}
                            {propuesta.evento && (
                                <div className="bg-white rounded-lg border border-emerald-200 p-3 mb-2 text-xs space-y-1">
                                    <p className="font-semibold text-slate-700 text-sm truncate">{propuesta.evento.titulo}</p>
                                    <p className="text-slate-500">
                                        {propuesta.evento.modalidad}
                                        {propuesta.evento.fecha_inicio && ` · ${propuesta.evento.fecha_inicio}`}
                                        {propuesta.evento.fecha_fin && propuesta.evento.fecha_fin !== propuesta.evento.fecha_inicio && ` → ${propuesta.evento.fecha_fin}`}
                                        {propuesta.evento.hora && ` · ${propuesta.evento.hora}`}
                                    </p>
                                    {propuesta.evento.cupos && (
                                        <p className="text-slate-500">Cupos: {propuesta.evento.cupos}</p>
                                    )}
                                    {propuesta.evento.descripcion && (
                                        <p className="text-slate-600 mt-1 border-t border-slate-100 pt-1 line-clamp-3">
                                            {propuesta.evento.descripcion}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Activities list */}
                            {propuesta.actividades?.length > 0 && (
                                <div className="bg-white rounded-lg border border-emerald-200 p-3 text-xs mb-1">
                                    <p className="font-semibold text-slate-700 mb-2">
                                        {propuesta.actividades.length} actividad{propuesta.actividades.length !== 1 ? 'es' : ''} propuesta{propuesta.actividades.length !== 1 ? 's' : ''}
                                    </p>
                                    <div className="space-y-1.5">
                                        {propuesta.actividades.map((a, i) => (
                                            <div
                                                key={i}
                                                className="flex gap-2 border-b border-slate-50 last:border-0 pb-1.5 last:pb-0"
                                            >
                                                <span
                                                    className="shrink-0 w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold"
                                                    style={{ fontSize: '10px' }}
                                                >
                                                    {i + 1}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-700 truncate">{a.titulo}</p>
                                                    <p className="text-slate-400">
                                                        {a.fecha_actividad} · {a.hora_inicio}–{a.hora_fin}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    if (aplicando) return;
                                    setAplicando(true);
                                    const p = propuesta;
                                    setPropuesta(null);
                                    onAplicar(p);
                                }}
                                disabled={aplicando}
                                className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={15} />
                                {modo === 'evento' ? 'Aplicar al formulario' : 'Crear actividades en la agenda'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Input area */}
                <div className="border-t border-slate-200 p-3 bg-white shrink-0 flex gap-2 items-end">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            modo === 'evento'
                                ? 'Describe el evento que quieres crear...'
                                : 'Describe las actividades que necesitas...'
                        }
                        rows={2}
                        disabled={cargando}
                        className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50 disabled:bg-slate-50"
                    />
                    <button
                        onClick={enviar}
                        disabled={cargando || !input.trim()}
                        className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl p-2.5 flex items-center justify-center transition-colors shrink-0"
                        aria-label="Enviar mensaje"
                    >
                        {cargando ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IAAsistente;
