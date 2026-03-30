import React from 'react';
import { Users, CalendarDays } from 'lucide-react';
import KpiCard from '../../../../components/ui/KpiCard';

const StatsCards = ({ stats }) => {
  const statItems = [
    { title: 'Total Empleados',    value: stats.totalEmpleados ?? 0, icon: Users,        variant: 'brand'   },
    { title: 'Eventos Publicados', value: stats.totalEventos    ?? 0, icon: CalendarDays, variant: 'success' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {statItems.map((item) => (
        <KpiCard key={item.title} title={item.title} value={item.value} icon={item.icon} variant={item.variant} />
      ))}
    </div>
  );
};

export default StatsCards;
