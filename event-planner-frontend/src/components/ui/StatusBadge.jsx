import React from 'react';
import { Badge } from './badge';

export const STATUS_MAP = {
  publicado:         { variant: 'published',    label: 'Publicado' },
  activo:            { variant: 'success',       label: 'Activo' },
  activa:            { variant: 'success',       label: 'Activa' },
  cancelado:         { variant: 'cancelled',     label: 'Cancelado' },
  cancelada:         { variant: 'cancelled',     label: 'Cancelada' },
  finalizado:        { variant: 'finished',      label: 'Finalizado' },
  finalizada:        { variant: 'finished',      label: 'Finalizada' },
  borrador:          { variant: 'draft',         label: 'Borrador' },
  en_curso:          { variant: 'info',          label: 'En Curso' },
  'en curso':        { variant: 'info',          label: 'En Curso' },

  aprobado:          { variant: 'success',       label: 'Aprobado' },
  aprobada:          { variant: 'success',       label: 'Aprobada' },
  rechazado:         { variant: 'destructive',   label: 'Rechazado' },
  rechazada:         { variant: 'destructive',   label: 'Rechazada' },
  pendiente:         { variant: 'warning',       label: 'Pendiente' },
  inactivo:          { variant: 'destructive',   label: 'Inactivo' },
  inactiva:          { variant: 'destructive',   label: 'Inactiva' },

  completada:        { variant: 'success',       label: 'Completada' },
  completado:        { variant: 'success',       label: 'Completado' },
  cerrada:           { variant: 'info',          label: 'Cerrada' },
  expirada:          { variant: 'destructive',   label: 'Expirada' },
  'no enviada':      { variant: 'secondary',     label: 'No enviada' },

  inscrito:          { variant: 'success',       label: 'Inscrito' },
  inscrita:          { variant: 'success',       label: 'Inscrita' },
  confirmado:        { variant: 'success',       label: 'Confirmado' },
  confirmada:        { variant: 'success',       label: 'Confirmada' },
  ausente:           { variant: 'destructive',   label: 'Ausente' },
  'no asistio':      { variant: 'destructive',   label: 'No asistió' },

  aceptado:          { variant: 'success',       label: 'Aceptado' },
  aceptada:          { variant: 'success',       label: 'Aceptada' },
  solicitud_cambio:  { variant: 'info',          label: 'Solicitud Cambio' },
  solicitudcambio:   { variant: 'info',          label: 'Solicitud Cambio' },

  habilitada:        { variant: 'success',       label: 'Habilitada' },
  deshabilitada:     { variant: 'secondary',     label: 'Deshabilitada' },
  habilitado:        { variant: 'success',       label: 'Habilitado' },
  deshabilitado:     { variant: 'secondary',     label: 'Deshabilitado' },
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
