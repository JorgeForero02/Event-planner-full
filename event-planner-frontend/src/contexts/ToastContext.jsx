import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

const ToastContext = createContext(null);

let idCounter = 0;

const ICONS = {
  success: CheckCircle2,
  error:   AlertCircle,
  warning: AlertCircle,
  info:    Info,
};

const STYLES = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  error:   'bg-rose-50   border-rose-200   text-rose-900',
  warning: 'bg-amber-50  border-amber-200  text-amber-900',
  info:    'bg-sky-50    border-sky-200    text-sky-900',
};

const ICON_STYLES = {
  success: 'text-emerald-500',
  error:   'text-rose-500',
  warning: 'text-amber-500',
  info:    'text-sky-500',
};

const DURATIONS = {
  success: 4000,
  info:    4000,
  warning: 5000,
  error:   6000,
};

function ToastItem({ toast, onRemove }) {
  const Icon = ICONS[toast.type] ?? Info;

  return (
    <div
      className={cn(
        'flex items-start gap-3 w-full max-w-sm rounded-lg border px-4 py-3 shadow-md',
        'animate-slide-up',
        STYLES[toast.type]
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon size={18} className={cn('shrink-0 mt-0.5', ICON_STYLES[toast.type])} />
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Cerrar notificación"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback((message, type = 'info') => {
    const id = ++idCounter;
    const duration = DURATIONS[type] ?? 4000;

    setToasts(prev => [...prev, { id, message, type }]);

    timers.current[id] = setTimeout(() => remove(id), duration);

    return id;
  }, [remove]);

  const success = useCallback((msg) => toast(msg, 'success'), [toast]);
  const error   = useCallback((msg) => toast(msg, 'error'),   [toast]);
  const warning = useCallback((msg) => toast(msg, 'warning'), [toast]);
  const info    = useCallback((msg) => toast(msg, 'info'),    [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, remove }}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-label="Notificaciones"
      >
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
