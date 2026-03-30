import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * EmptyState — estado vacío reutilizable para tablas, listas y secciones.
 *
 * Props:
 *  icon        ComponentType (Lucide)  — icono central (default: Inbox)
 *  title       string                  — título del estado vacío
 *  description string                  — descripción opcional
 *  className   string                  — clases adicionales para el contenedor
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Sin registros',
  description = 'No hay datos disponibles para mostrar.',
  className,
}) => (
  <div className={cn(
    'flex flex-col items-center justify-center py-12 px-4 text-center',
    className
  )}>
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
      <Icon size={24} className="text-slate-400" />
    </div>
    <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{description}</p>
  </div>
);

export default EmptyState;
