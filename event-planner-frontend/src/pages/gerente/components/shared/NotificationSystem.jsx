import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../../../lib/utils';

const typeStyles = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-rose-50   border-rose-200   text-rose-800',
  warning: 'bg-amber-50  border-amber-200  text-amber-800',
  info:    'bg-sky-50    border-sky-200    text-sky-800',
};

const typeIcons = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertCircle,
  info:    Info,
};

const NotificationSystem = ({ notifications = [], onClose }) => {
  if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80">
      {notifications.map((notification) => {
        if (!notification || typeof notification !== 'object') return null;
        const type = notification.type || 'info';
        const Icon = typeIcons[type] || Info;

        return (
          <div
            key={notification.id || Math.random()}
            className={cn(
              'flex items-start gap-3 p-3 rounded-xl border shadow-modal animate-fade-in',
              typeStyles[type]
            )}
          >
            <Icon size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-snug">{notification.title || 'Notificación'}</p>
              <p className="text-xs opacity-80 mt-0.5 leading-snug">{notification.message || ''}</p>
            </div>
            <button
              onClick={() => onClose && onClose(notification.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationSystem;