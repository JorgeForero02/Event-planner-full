import React from 'react';
import { Users, CalendarDays, ClipboardList, BarChart2 } from 'lucide-react';
import KpiCard from '../../../../components/ui/KpiCard';

const RolRow = ({ rol, count }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
        <span className="text-sm text-slate-600 capitalize">{rol}</span>
        <span className="text-sm font-semibold text-slate-800">{count}</span>
    </div>
);

const SystemStatsMetrics = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
                <div className="h-5 w-40 rounded bg-slate-200 animate-pulse mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data) return null;

    const roles = data.usuarios_por_rol || {};

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-5">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Estadísticas del Sistema</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard icon={Users}        title="Total usuarios"              value={roles.total}                                    variant="brand"   />
                <KpiCard icon={CalendarDays} title="Eventos activos"             value={data.eventos_activos}                           variant="success" />
                <KpiCard icon={ClipboardList} title="Inscripciones confirmadas"  value={data.total_inscripciones_confirmadas}            variant="warning" />
                <KpiCard icon={BarChart2}    title="Tasa asistencia global"      value={`${data.tasa_global_asistencia ?? 0}%`}         variant="default" />
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Usuarios por rol</h4>
                <div className="grid grid-cols-2 gap-x-8">
                    {['administrador', 'gerente', 'organizador', 'ponente', 'asistente'].map(rol => (
                        <RolRow key={rol} rol={rol} count={roles[rol] ?? 0} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SystemStatsMetrics;
