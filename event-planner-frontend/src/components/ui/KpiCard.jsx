import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * KpiCard — card de métrica/KPI unificada para los 5 roles.
 *
 * Props:
 *  title     string                                   — etiqueta de la métrica
 *  value     string | number                          — valor principal
 *  icon      ComponentType (Lucide)                   — icono (opcional)
 *  trend     { value: number, label: string, positive: boolean } — tendencia (opcional)
 *  variant   'default' | 'brand' | 'success' | 'warning' | 'danger' — color del icono
 *  progress  number (0-100)                           — barra de progreso (opcional)
 */

const variantMap = {
  default: {
    iconBg:      'bg-slate-100',
    iconColor:   'text-slate-600',
    progressBar: 'bg-slate-400',
  },
  brand: {
    iconBg:      'bg-brand-50',
    iconColor:   'text-brand-600',
    progressBar: 'bg-brand-600',
  },
  success: {
    iconBg:      'bg-success/10',
    iconColor:   'text-success',
    progressBar: 'bg-success',
  },
  warning: {
    iconBg:      'bg-warning/10',
    iconColor:   'text-warning',
    progressBar: 'bg-warning',
  },
  danger: {
    iconBg:      'bg-danger/10',
    iconColor:   'text-danger',
    progressBar: 'bg-danger',
  },
};

const KpiCard = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  progress,
}) => {
  const styles = variantMap[variant] ?? variantMap.default;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card p-6">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
            styles.iconBg
          )}>
            <Icon size={22} className={styles.iconColor} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide leading-none">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 leading-tight mt-1">
            {value ?? '—'}
          </p>

          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-1.5 text-xs font-medium',
              trend.positive ? 'text-success' : 'text-danger'
            )}>
              {trend.positive
                ? <TrendingUp size={12} className="shrink-0" />
                : <TrendingDown size={12} className="shrink-0" />}
              <span>
                {trend.positive ? '+' : ''}{trend.value} {trend.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              styles.progressBar
            )}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default KpiCard;
