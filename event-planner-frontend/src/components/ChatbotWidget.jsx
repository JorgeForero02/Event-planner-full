import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { consultarChatbot } from '../services/iaService';
import { Button } from './ui/button';
import { Input } from './ui/input';

const ChatbotWidget = () => {
    const { isAuthenticated } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hola, soy el asistente de EventPlanner. ¿En qué puedo ayudarte?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (open && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, open]);

    if (!isAuthenticated) return null;

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text }]);
        setLoading(true);
        try {
            const respuesta = await consultarChatbot(text);
            setMessages(prev => [...prev, { role: 'bot', text: respuesta }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: 'No pude obtener una respuesta. Intenta de nuevo.', error: true }]);
        }
        setLoading(false);
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
            {open && (
                <div className="w-80 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-fade-in">
                    <div className="flex items-center justify-between bg-brand-600 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Bot size={18} className="text-white" />
                            <span className="text-sm font-semibold text-white">Asistente EventPlanner</span>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-white/80 hover:text-white transition-colors"
                            aria-label="Cerrar chat"
                        >
                            <ChevronDown size={18} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 overflow-y-auto p-4 h-72 bg-slate-50">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-brand-600 text-white'
                                            : msg.error
                                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                            : 'bg-white text-slate-700 border border-slate-200 shadow-sm'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
                                    <Loader2 size={16} className="animate-spin text-brand-600" />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div className="flex gap-2 border-t border-slate-200 p-3 bg-white">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Escribe tu pregunta..."
                            disabled={loading}
                            className="flex-1 text-sm"
                        />
                        <Button
                            size="icon"
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="shrink-0 h-9 w-9"
                        >
                            <Send size={15} />
                        </Button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center justify-center h-13 w-13 rounded-full bg-brand-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
                style={{ width: 52, height: 52 }}
                aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </button>
        </div>
    );
};

export default ChatbotWidget;
