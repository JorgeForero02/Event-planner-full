import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';
import EmptyState from './EmptyState';

/**
 * DataTable — tabla reutilizable con skeleton, estado vacío y clic en fila.
 *
 * Props:
 *  columns     { key, label, render?(value, row) }[]  — definición de columnas
 *  data        object[]                               — filas
 *  loading     boolean                                — muestra skeleton de 5 filas
 *  emptyState  { icon?, title?, description? }        — estado vacío personalizado
 *  onRowClick  (row) => void                          — clic en fila (opcional)
 *  className   string                                 — clases adicionales para el wrapper
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyState,
  onRowClick,
  className,
}) => {
  const empty = {
    icon: Inbox,
    title: 'Sin registros',
    description: 'No hay datos disponibles para mostrar.',
    ...emptyState,
  };

  return (
    <div className={cn('border border-slate-200 rounded-xl overflow-hidden shadow-card', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr key={rowIdx} className="border-t border-slate-100">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={empty.icon}
                    title={empty.title}
                    description={empty.description}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-t border-slate-100 hover:bg-slate-50 transition-colors duration-200',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-700">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
