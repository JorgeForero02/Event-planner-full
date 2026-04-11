import { useState, useEffect } from 'react';
import EventCard from '../ui/EventCard';
import EventModal from '../ui/EventModal';
import { useEventos } from '../../hooks/useEventos';
import { ponenteEventosService } from '../../../../services/ponenteEventosService';
import { formatFecha, formatHora, formatFechaCompleta } from '../../../asistente/utils/dateUtils';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';

const EventosSection = ({ onEventoSelect }) => {
  const { eventos, loading, error } = useEventos();
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalEvento, setModalEvento] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    if (eventos.length > 0 && !selectedEvento) {
      setSelectedEvento(eventos[0]);
      onEventoSelect(eventos[0]);
    }
  }, [eventos, selectedEvento, onEventoSelect]);

  // eslint-disable-next-line no-unused-vars
  const _handleEventoSelect = (evento) => {
    setSelectedEvento(evento);
    onEventoSelect(evento);
  };

  const handleViewDetails = async (evento) => {
    try {
      setModalLoading(true);
      setModalError(null);

      const token = localStorage.getItem('access_token');
      const eventoCompleto = await ponenteEventosService.obtenerDetallesEvento(evento.id, token);

      setModalEvento(eventoCompleto);
      setShowModal(true);
    } catch {
      setModalError('No se pudieron cargar los detalles completos del evento');
      setModalEvento(evento);
      setShowModal(true);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalEvento(null);
    setModalError(null);
  };

  const determinarEstadoEvento = (evento) => {
    const ahora = new Date();
    const fechaInicio = new Date(evento.fecha_inicio);
    const fechaFin = new Date(evento.fecha_fin);

    if (ahora > fechaFin) {
      return { texto: 'FINALIZADO', disponible: false };
    }
    if (ahora >= fechaInicio && ahora <= fechaFin) {
      return { texto: 'EN CURSO', disponible: true };
    }
    if (evento.cupos_disponibles === 0) {
      return { texto: 'CUPOS AGOTADOS', disponible: false };
    }
    if (ahora < fechaInicio) {
      return { texto: 'POR COMENZAR', disponible: true };
    }
    return { texto: 'DISPONIBLE', disponible: true };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Cargando eventos disponibles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-sm text-danger">Error al cargar eventos: {error}</p>
        <button onClick={() => window.location.reload()}
          className="h-9 px-5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Eventos Disponibles</h2>
        <p className="text-sm text-slate-500 mt-0.5">Consulta los eventos publicados</p>
      </div>

      {eventos.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-600 font-medium">No hay eventos disponibles en este momento.</p>
          <p className="text-sm text-slate-500 mt-1">Los eventos aparecerán aquí cuando sean publicados por los organizadores.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500">Se encontraron {eventos.length} evento(s) disponible(s)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {eventos.map(evento => (
              <EventCard
                key={evento.id}
                evento={evento}
                estado={determinarEstadoEvento(evento)}
                onViewDetails={handleViewDetails}
                formatFecha={formatFecha}
                formatHora={formatHora}
              />
            ))}
          </div>
        </>
      )}

      <Dialog open={showModal && !!modalEvento} onOpenChange={(open) => !open && !modalLoading && closeModal()}>
        <DialogContent className="max-w-2xl">
          {modalLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Cargando detalles del evento...</p>
            </div>
          ) : (
            <EventModal
              evento={modalEvento}
              onClose={closeModal}
              formatFecha={formatFecha}
              formatFechaCompleta={formatFechaCompleta}
              error={modalError}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventosSection;