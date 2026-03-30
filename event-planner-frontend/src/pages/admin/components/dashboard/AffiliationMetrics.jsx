import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { RefreshCw, AlertCircle, Building2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import KpiCard from '../../../../components/ui/KpiCard';

const AffiliationMetrics = ({
  data,
  loading,
  error,
  onRefresh
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Gestión de Afiliaciones</CardTitle>
          <Button variant="ghost" size="icon" disabled>
            <RefreshCw className="h-4 w-4 animate-spin text-slate-500" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-600 mb-4" />
            <p className="text-slate-500 font-medium">Cargando datos de afiliaciones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Gestión de Afiliaciones</CardTitle>
          <Button variant="ghost" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 text-slate-500" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <p className="text-red-600 font-medium mb-4">{error || 'Datos no disponibles'}</p>
            <Button variant="outline" onClick={onRefresh}>Reintentar</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    pendientes = 0,
    aprobadas = 0,
    rechazadas = 0
  } = data;

  const totalEmpresas = pendientes + aprobadas + rechazadas;

  const calculatePercentage = (value) => {
    return totalEmpresas > 0 ? (value / totalEmpresas) * 100 : 0;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50 border-b border-slate-100 pb-4">
        <div>
          <CardTitle className="text-xl font-bold text-slate-800">Gestión de Afiliaciones</CardTitle>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          title="Actualizar datos"
        >
          <RefreshCw className="h-4 w-4 text-slate-600" />
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KpiCard
            icon={Clock}
            title="Pendientes"
            value={pendientes}
            variant="warning"
            progress={calculatePercentage(pendientes)}
          />
          <KpiCard
            icon={CheckCircle2}
            title="Aprobadas"
            value={aprobadas}
            variant="success"
            progress={calculatePercentage(aprobadas)}
          />
          <KpiCard
            icon={XCircle}
            title="Rechazadas"
            value={rechazadas}
            variant="danger"
            progress={calculatePercentage(rechazadas)}
          />
        </div>

        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <Building2 className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Empresas Registradas</p>
              <p className="text-2xl font-bold text-slate-800">{totalEmpresas}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliationMetrics;
