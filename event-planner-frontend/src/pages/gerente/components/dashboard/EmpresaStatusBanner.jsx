import React from 'react';
import { Clock, XCircle, AlertTriangle } from 'lucide-react';

const ESTADO_CONFIG = {
  0: {
    label: 'Pendiente de revisión',
    Icon: Clock,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    iconColor: 'text-amber-500',
    message: 'Tu solicitud de afiliación está en proceso de revisión por el equipo de administración.',
  },
  2: {
    label: 'Rechazada',
    Icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-500',
    message: 'Tu solicitud de afiliación fue rechazada. Puedes enviar una nueva solicitud desde el menú Empresa → Solicitudes de Cambio.',
  },
};

const EmpresaStatusBanner = ({ empresa }) => {
  if (!empresa) return null;

  const estado = empresa.estado;

  if (estado === 1 || estado === 'aprobado') return null;

  const config = ESTADO_CONFIG[estado] ?? {
    label: `Estado desconocido (${estado})`,
    Icon: AlertTriangle,
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-800',
    iconColor: 'text-slate-500',
    message: '',
  };

  const { Icon, label, bg, border, text, iconColor, message } = config;

  return (
    <div className={`rounded-xl border ${border} ${bg} px-5 py-4 flex items-start gap-3`}>
      <Icon size={20} className={`${iconColor} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${text}`}>
          Estado de tu empresa:{' '}
          <span className="font-bold">{label}</span>
        </p>
        {message && (
          <p className={`text-sm mt-0.5 ${text} opacity-90`}>{message}</p>
        )}
        {estado === 2 && empresa.motivo_rechazo && (
          <div className="mt-2 rounded-lg bg-red-100 border border-red-200 px-3 py-2">
            <p className="text-xs font-semibold text-red-700 mb-0.5">Motivo del rechazo:</p>
            <p className="text-sm text-red-800">{empresa.motivo_rechazo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpresaStatusBanner;
