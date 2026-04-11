import { useState, useEffect } from 'react';
import { usePonenteAgenda } from '../../hooks/usePonenteAgenda';
import { CalendarDays } from 'lucide-react';
import DataTable from '../../../../components/ui/DataTable';

const estadoBadgeClasses = {
    pendiente:         'bg-amber-100 text-amber-700',
    aceptado:          'bg-emerald-100 text-emerald-700',
    solicitud_cambio:  'bg-rose-100 text-rose-700',
};

const AgendaSection = ({ evento }) => {
    const {
        cargarAgendaPorEvento,
        loading,
        error
    } = usePonenteAgenda();

    const [agenda, setAgenda] = useState([]);

    useEffect(() => {
        if (evento) {
            loadAgendaEvento();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [evento]);

    const loadAgendaEvento = async () => {
        try {
            const actividades = await cargarAgendaPorEvento(evento.id);
            setAgenda(actividades);
        } catch (err) {
        }
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const columns = [
        {
            key: 'fecha',
            label: 'Fecha',
            render: (_, row) => new Date(row.actividad.fecha_actividad).toLocaleDateString('es-ES'),
        },
        {
            key: 'hora_inicio',
            label: 'Hora Inicio',
            render: (_, row) => formatTime(row.actividad.hora_inicio),
        },
        {
            key: 'hora_fin',
            label: 'Hora Fin',
            render: (_, row) => formatTime(row.actividad.hora_fin),
        },
        {
            key: 'titulo',
            label: 'Actividad',
            render: (_, row) => (
                <span className="font-medium text-slate-800">{row.actividad.titulo}</span>
            ),
        },
        {
            key: 'tipo',
            label: 'Tipo',
            render: (_, row) => (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-brand-100 text-brand-700">
                    {row.actividad.tipo}
                </span>
            ),
        },
        {
            key: 'ubicacion',
            label: 'Ubicación',
            render: (_, row) => row.actividad.ubicacion || 'Por asignar',
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            render: (_, row) => (
                <span className="text-slate-500 text-xs">
                    {row.actividad.descripcion || 'Sin descripción'}
                </span>
            ),
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (val) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoBadgeClasses[val] ?? 'bg-slate-100 text-slate-600'}`}>
                    {val}
                </span>
            ),
        },
    ];

    if (!evento) {
        return (
            <div className="p-6 flex flex-col items-center justify-center h-64 text-center">
                <CalendarDays size={40} className="text-slate-300 mb-3" />
                <h2 className="text-base font-semibold text-slate-700 mb-1">Mis Agendas</h2>
                <p className="text-sm text-slate-500">Selecciona un evento para ver tu agenda</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Agenda — {evento.nombre}</h2>
                <button
                    onClick={loadAgendaEvento}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 border border-brand-200 hover:bg-brand-50 transition-colors cursor-pointer"
                >
                    Actualizar
                </button>
            </div>

            <DataTable
                columns={columns}
                data={agenda}
                loading={loading}
                emptyState={{
                    icon: CalendarDays,
                    title: 'Sin actividades',
                    description: 'No tienes actividades asignadas en este evento.',
                }}
            />
        </div>
    );
};

export default AgendaSection;
