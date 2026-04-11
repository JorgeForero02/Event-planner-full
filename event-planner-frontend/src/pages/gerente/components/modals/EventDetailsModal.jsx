import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import StatusBadge from '../../../../components/ui/StatusBadge';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
    <span className="text-xs font-medium text-slate-500 shrink-0">{label}</span>
    <span className="text-xs text-slate-700 text-right">{value || '—'}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-slate-50 rounded-xl p-4 space-y-0">
    <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">{title}</h4>
    {children}
  </div>
);

const EventDetailsModal = ({
  evento,
  onClose,
  formatFecha,
  formatHora,
  getEstadoEvento
}) => {
  const estado = getEstadoEvento(evento);
  const [reporte, setReporte] = useState(null);

  useEffect(() => {
    if (!evento?.id) return;
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    fetch(`${API_BASE}/eventos/${evento.id}/reporte`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.success) setReporte(data.data); })
      .catch(() => {});
  }, [evento?.id]);
  const fechaInicio = formatFecha(evento.fecha_inicio || evento.fecha);
  const hora = formatHora(evento.hora);

  const getNombreCreador = () => {
    if (!evento.creador) return 'No especificado';
    if (typeof evento.creador === 'string') return evento.creador;
    if (typeof evento.creador === 'object') return evento.creador.nombre || 'No especificado';
    return 'No especificado';
  };

  const getNombreEmpresa = () => {
    if (!evento.empresa) return 'No especificada';
    if (typeof evento.empresa === 'string') return evento.empresa;
    if (typeof evento.empresa === 'object') return evento.empresa.nombre || 'No especificada';
    return 'No especificada';
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-800 truncate">
                {evento.titulo || evento.nombre || 'Evento sin título'}
              </h2>
              <StatusBadge status={(estado.clase || '').toLowerCase()} label={estado.texto} className="mt-1" />
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 ml-4">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Section title="Información General">
            <InfoRow label="Modalidad" value={evento.modalidad || 'Presencial'} />
            <InfoRow label="Organizador" value={getNombreCreador()} />
            <InfoRow label="Empresa" value={getNombreEmpresa()} />
          </Section>

          <Section title="Fecha y Horario">
            <InfoRow label="Fecha inicio" value={fechaInicio} />
            {evento.fecha_fin && <InfoRow label="Fecha fin" value={formatFecha(evento.fecha_fin)} />}
            <InfoRow label="Hora" value={hora || 'Por definir'} />
          </Section>

          <Section title="Capacidad y Ocupación">
            <InfoRow
              label="Cupos totales"
              value={estado.cuposTotales > 0 ? estado.cuposTotales : 'Sin límite'}
            />
            {estado.cuposDisponibles !== null && (
              <InfoRow label="Cupos disponibles" value={estado.cuposDisponibles} />
            )}
            {estado.cuposOcupados !== null && (
              <InfoRow label="Cupos ocupados" value={estado.cuposOcupados} />
            )}
            {estado.porcentaje > 0 && (
              <InfoRow label="Ocupación" value={`${estado.porcentaje}%`} />
            )}
          </Section>

          {(evento.fecha_creacion || evento.fecha_actualizacion) && (
            <Section title="Fechas del Sistema">
              {evento.fecha_creacion && <InfoRow label="Creado" value={formatFecha(evento.fecha_creacion)} />}
              {evento.fecha_actualizacion && <InfoRow label="Actualizado" value={formatFecha(evento.fecha_actualizacion)} />}
            </Section>
          )}

          {evento.descripcion && evento.descripcion !== 'null' && evento.descripcion !== 'Sin descripción disponible' && (
            <div className="sm:col-span-2">
              <Section title="Descripción">
                <p className="text-sm text-slate-700 leading-relaxed">{evento.descripcion}</p>
              </Section>
            </div>
          )}

          {reporte && (
            <div className="sm:col-span-2">
              <Section title="Reporte del Evento">
                <InfoRow label="Inscritos confirmados" value={reporte.total_inscritos} />
                <InfoRow label="Asistencias registradas" value={reporte.total_asistencias} />
                <InfoRow label="Tasa de asistencia" value={`${reporte.tasa_asistencia}%`} />
                <InfoRow label="Encuestas enviadas" value={reporte.encuestas_enviadas} />
                <InfoRow label="Encuestas respondidas" value={reporte.encuestas_respondidas} />
                <InfoRow label="Tasa de respuesta" value={`${reporte.tasa_respuesta}%`} />
              </Section>
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
