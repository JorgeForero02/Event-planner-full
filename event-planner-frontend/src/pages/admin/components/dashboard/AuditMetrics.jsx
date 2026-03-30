import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { RefreshCw, AlertCircle, ListTodo, ChevronDown, ChevronUp, History } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';

const AuditMetrics = ({
  data,
  loading,
  error,
  mostrarTodosRegistros,
  onRefresh,
  onToggleMostrarTodos
}) => {
  const auditoriaRegistros = data || []; 

  const getAuditoriaDisplayData = (registro) => {
    return {
      usuario: registro.usuario?.nombre || registro.usuario?.email || 'Sistema',
      mensaje: registro.mensaje || registro.accion || 'Acción no especificada',
      tipo: registro.tipo || 'Sistema',
      fecha: registro.fecha || 'Fecha no disponible',
      hora: registro.hora || ''
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Registros de Auditoría</CardTitle>
          <Button variant="ghost" size="icon" disabled>
            <RefreshCw className="h-4 w-4 animate-spin text-slate-500" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-600 mb-4" />
            <p className="text-slate-500 font-medium">Cargando auditoría...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Registros de Auditoría</CardTitle>
          <Button variant="ghost" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 text-slate-500" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <Button variant="outline" onClick={onRefresh}>Reintentar</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50 border-b border-slate-100 pb-4">
        <div>
          <CardTitle className="text-xl font-bold text-slate-800">Registros de Auditoría</CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3">
            {auditoriaRegistros.length} registros
          </Badge>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            title="Actualizar datos"
          >
            <RefreshCw className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {auditoriaRegistros.length > 0 ? (
          <AuditTimeline
            registros={auditoriaRegistros}
            mostrarTodos={mostrarTodosRegistros}
            onToggleMostrarTodos={onToggleMostrarTodos}
            getDisplayData={getAuditoriaDisplayData}
          />
        ) : (
          <NoData onRetry={onRefresh} />
        )}
      </CardContent>
    </Card>
  );
};

const AuditTimeline = ({
  registros,
  mostrarTodos,
  onToggleMostrarTodos,
  getDisplayData
}) => {
  const registrosAMostrar = mostrarTodos ? registros : registros.slice(0, 8);

  return (
    <div className="flex flex-col">
      <div className="divide-y divide-slate-100">
        {registrosAMostrar.map((registro, index) => {
          const displayData = getDisplayData(registro);
          return (
            <AuditTimelineItem
              key={registro.id || index}
              displayData={displayData}
            />
          );
        })}
      </div>

      {registros.length > 8 && (
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
          <Button
            variant="ghost"
            className="text-brand-600 hover:text-brand-600/90 hover:bg-blue-50"
            onClick={onToggleMostrarTodos}
          >
            {mostrarTodos ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Ver {registros.length - 8} registros más
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

const AuditTimelineItem = ({ displayData }) => {
  const getBadgeVariant = (tipo) => {
    switch(tipo?.toLowerCase()) {
      case 'creacion': return 'success';
      case 'actualizacion': return 'info';
      case 'eliminacion': return 'destructive';
      case 'read': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="p-5 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-brand-600 flex items-center justify-center shrink-0 font-bold text-sm">
            {displayData.usuario.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{displayData.usuario}</p>
            <div className="flex items-center text-xs text-slate-500 gap-1.5 mt-0.5">
              <History className="w-3.5 h-3.5" />
              <span>{displayData.fecha} {displayData.hora}</span>
            </div>
          </div>
        </div>
        <Badge variant={getBadgeVariant(displayData.tipo)}>
          {displayData.tipo}
        </Badge>
      </div>
      <div className="text-sm text-slate-600 ml-10">
        <p>{displayData.mensaje}</p>
      </div>
    </div>
  );
};

const NoData = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
      <ListTodo className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800 mb-1">No hay registros de auditoría</h3>
    <p className="text-slate-500 mb-6 max-w-sm">
      Los eventos y acciones importantes del sistema se registrarán y aparecerán aquí
    </p>
    <Button variant="outline" onClick={onRetry}>
      <RefreshCw className="w-4 h-4 mr-2" />
      Actualizar
    </Button>
  </div>
);

export default AuditMetrics;
