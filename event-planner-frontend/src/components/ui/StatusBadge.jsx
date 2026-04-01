import React from 'react';
import { Badge } from './badge';

export const STATUS_MAP = {
  // Event states
  publicado:         { variant: 'published',   label: 'Publicado' },
  activo:            { variant: 'success',      label: 'Activo' },
  cancelado:         { variant: 'cancelled',    label: 'Cancelado' },
  finalizado:        { variant: 'finished',     label: 'Finalizado' },
  borrador:          { variant: 'draft',        label: 'Borrador' },

  // Survey / response states
  activa:            { variant: 'success',      label: 'Activa' },
  completada:        { variant: 'success',      label: 'Completada' },
  pendiente:         { variant: 'warning',      label: 'Pendiente' },
  cerrada:           { variant: 'info',         label: 'Cerrada' },
  expirada:          { variant: 'destructive',  label: 'Expirada' },
  'no enviada':      { variant: 'secondary',    label: 'No enviada' },

  // Attendance states
  confirmado:        { variant: 'success',      label: 'Confirmado' },
  confirmada:        { variant: 'success',      label: 'Confirmada' },
  ausente:           { variant: 'destructive',  label: 'Ausente' },

  // Activity invitation states
  aceptado:          { variant: 'success',      label: 'Aceptado' },
  rechazado:         { variant: 'destructive',  label: 'Rechazado' },
  solicitud_cambio:  { variant: 'info',         label: 'Solicitud Cambio' },
  solicitudcambio:   { variant: 'info',         label: 'Solicitud Cambio' },

  // Location / Place states
  habilitada:        { variant: 'success',      label: 'Habilitada' },
  deshabilitada:     { variant: 'secondary',    label: 'Deshabilitada' },
  habilitado:        { variant: 'success',      label: 'Habilitado' },
  deshabilitado:     { variant: 'secondary',    label: 'Deshabilitado' },
};

const StatusBadge = ({ status, label, className }) => {
  const normalized = (status ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
  const mapping = STATUS_MAP[normalized];
  const variant = mapping?.variant ?? 'outline';
  const displayLabel = label ?? mapping?.label ?? status ?? '';

  return (
    <Badge variant={variant} className={className}>
      {displayLabel}
    </Badge>
  );
};

export default StatusBadge;
