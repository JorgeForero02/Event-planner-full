import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import AffiliationMetrics from './AffiliationMetrics';
import AuditMetrics from './AuditMetrics';
import SystemStatsMetrics from './SystemStatsMetrics';

const AdminDashboard = () => {
    const {
        dashboardData,
        loading,
        error,
        mostrarTodosRegistros,
        fetchDashboardData,
        setMostrarTodosRegistros
    } = useAdminDashboard();

    return (
        <div className="flex-1 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">Panel de Administración</h1>
                <p className="text-slate-500">
                    Gestión integral del sistema y supervisión de actividades
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <SystemStatsMetrics
                    data={dashboardData.stats}
                    loading={loading}
                />

                <AffiliationMetrics
                    data={dashboardData.afiliaciones}
                    loading={loading}
                    error={error}
                    onRefresh={fetchDashboardData}
                />

                <AuditMetrics
                    data={dashboardData.auditoria}
                    loading={loading}
                    error={error}
                    mostrarTodosRegistros={mostrarTodosRegistros}
                    onRefresh={fetchDashboardData}
                    onToggleMostrarTodos={() => setMostrarTodosRegistros(!mostrarTodosRegistros)}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;