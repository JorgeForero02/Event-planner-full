import { useState } from 'react';
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import KpiCard from '../../../../components/ui/KpiCard';

const DashboardSection = ({ actividades, loading }) => {
    const [filter] = useState('todas');

    const actividadesSeguras = actividades || [];

    // eslint-disable-next-line no-unused-vars
    const _actividadesFiltradas = actividadesSeguras.filter(actividad => {
        if (filter === 'pendientes') return actividad.estado === 'pendiente';
        if (filter === 'aceptadas') return actividad.estado === 'aceptado';
        if (filter === 'solicitud_cambio') return actividad.estado === 'solicitud_cambio';
        return true;
    });

    const estadisticas = {
        total: actividadesSeguras.length,
        pendientes: actividadesSeguras.filter(a => a.estado === 'pendiente').length,
        aceptadas: actividadesSeguras.filter(a => a.estado === 'aceptado').length,
        conSolicitud: actividadesSeguras.filter(a => a.estado === 'solicitud_cambio').length,
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-sm text-slate-500">Cargando actividades...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mi Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Resumen de tus actividades y eventos</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={ClipboardList}
                    title="Total Actividades"
                    value={estadisticas.total}
                    variant="brand"
                />
                <KpiCard
                    icon={Clock}
                    title="Pendientes"
                    value={estadisticas.pendientes}
                    variant="warning"
                />
                <KpiCard
                    icon={CheckCircle2}
                    title="Aceptadas"
                    value={estadisticas.aceptadas}
                    variant="success"
                />
                <KpiCard
                    icon={AlertCircle}
                    title="Con Solicitud"
                    value={estadisticas.conSolicitud}
                    variant="default"
                />
            </div>
        </div>
    );
};

export default DashboardSection;
