import React from 'react';
import { Users, CalendarDays } from 'lucide-react';

const StatBox = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 shadow-card px-5 py-4">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-brand-50">
      <Icon size={22} className="text-brand-600" />
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
    </div>
  </div>
);

const StatsCards = ({ stats }) => {
  const statItems = [
    { label: 'Total Empleados',    value: stats.totalEmpleados ?? 0, icon: Users },
    { label: 'Eventos Publicados', value: stats.totalEventos    ?? 0, icon: CalendarDays },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {statItems.map((item) => (
        <StatBox key={item.label} label={item.label} value={item.value} icon={item.icon} />
      ))}
    </div>
  );
};

export default StatsCards;
