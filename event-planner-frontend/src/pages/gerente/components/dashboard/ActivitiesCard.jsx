import React from 'react';
import { Activity, Clock } from 'lucide-react';

const activities = [
  { text: 'Actualización de información empresarial', time: 'Hace 2 horas' },
  { text: 'Nuevo proyecto asignado al equipo',           time: 'Hace 5 horas' },
  { text: 'Revisión de solicitudes pendientes',          time: 'Ayer' },
];

const ActivityItem = ({ text, time }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm text-slate-700 leading-snug">{text}</p>
      <span className="flex items-center gap-1 text-xs text-slate-400 mt-1">
        <Clock size={10} />{time}
      </span>
    </div>
  </div>
);

const ActivitiesCard = () => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-card">
    <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
      <Activity size={18} className="text-brand-600" />
      <h3 className="text-sm font-semibold text-slate-700">Actividades Recientes</h3>
    </div>
    <div className="px-5 py-1">
      {activities.map((a, i) => (
        <ActivityItem key={i} text={a.text} time={a.time} />
      ))}
    </div>
  </div>
);

export default ActivitiesCard;