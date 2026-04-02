import React, { useState } from 'react';
import { Building2, Hash, MapPin, Phone, Mail, CheckCircle2, XCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { API_URL } from '../../../../config/apiConfig';
import { Card, CardContent, CardFooter } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

const ESTADO_LABELS = { 0: 'Pendiente', 1: 'Aprobada', 2: 'Rechazada' };

const EmpresaCard = ({ 
  empresa, 
  status = 'aprobada',
  onApprove,
  onReject,
  showActions = false 
}) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const fetchDetail = async () => {
    setDetailLoading(true);
    setDetailError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/empresas/${empresa.id}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al cargar el detalle');
      }
      const result = await response.json();
      setDetailData(result.data || result);
    } catch (e) {
      setDetailError(e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenDetail = () => {
    setDetailOpen(true);
    if (!detailData) fetchDetail();
  };
  const renderStatusBadge = () => {
    switch (status) {
      case 'aprobada':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 mt-4 self-start"><CheckCircle2 className="w-3 h-3 mr-1" /> Aprobada</Badge>;
      case 'pendiente':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 mt-4 self-start"><Clock className="w-3 h-3 mr-1" /> Pendiente</Badge>;
      case 'rechazada':
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 mt-4 self-start"><XCircle className="w-3 h-3 mr-1" /> Rechazada</Badge>;
      default:
        return null;
    }
  };

  const renderRejectionInfo = () => {
    if (status !== 'rechazada' || !empresa.motivo_rechazo) return null;

    return (
      <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5" />
        <div className="text-sm">
          <strong className="text-rose-700 block">Motivo del rechazo:</strong>
          <p className="text-rose-600 mt-1">{empresa.motivo_rechazo}</p>
        </div>
      </div>
    );
  };

  const data = detailData || empresa;
  const creador = empresa.creador || null;

  return (
    <>
      <Card className="h-full flex flex-col justify-between">
        <CardContent className="pt-6 flex flex-col items-start h-full">
          <div className="space-y-3 w-full">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-semibold text-slate-900 line-clamp-1">{empresa.nombre}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Hash className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{empresa.nit}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{empresa.direccion}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{empresa.telefono}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{empresa.correo || empresa.email}</span>
            </div>
          </div>

          {renderStatusBadge()}
          {renderRejectionInfo()}
        </CardContent>

        <CardFooter className="pt-2 border-t mt-auto flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full" onClick={handleOpenDetail}>
            <Eye className="w-4 h-4 mr-2" /> Ver detalle
          </Button>
          {showActions && (
            <>
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                onClick={() => onApprove(empresa.id, empresa.nombre)}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Aprobar
              </Button>
              <Button 
                variant="destructive"
                className="w-full"
                onClick={() => onReject(empresa.id, empresa.nombre)}
              >
                <XCircle className="w-4 h-4 mr-2" /> Rechazar
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {detailOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDetailOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Detalle de Empresa</h2>
              </div>
              <button
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                onClick={() => setDetailOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex flex-col gap-4">
              {detailLoading && (
                <div className="flex items-center justify-center h-24 text-slate-500">Cargando...</div>
              )}
              {detailError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">{detailError}</div>
              )}
              {!detailLoading && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nombre</p>
                    <p className="text-sm text-slate-800 font-medium">{data.nombre || '—'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">NIT</p>
                      <p className="text-sm text-slate-800">{data.nit || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Estado</p>
                      <p className="text-sm text-slate-800">{ESTADO_LABELS[data.estado] ?? '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Dirección</p>
                    <p className="text-sm text-slate-800">{data.direccion || '—'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Teléfono</p>
                      <p className="text-sm text-slate-800">{data.telefono || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Correo</p>
                      <p className="text-sm text-slate-800 break-all">{data.correo || data.email || '—'}</p>
                    </div>
                  </div>
                  {creador && (
                    <div className="space-y-1 pt-3 border-t border-slate-100">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Solicitante</p>
                      <p className="text-sm text-slate-800 font-medium">{creador.nombre || '—'}</p>
                      <p className="text-sm text-slate-600">{creador.correo || '—'}</p>
                    </div>
                  )}
                  {(data.motivo_rechazo || empresa.motivo_rechazo) && (
                    <div className="space-y-1 pt-3 border-t border-slate-100">
                      <p className="text-xs font-medium text-rose-500 uppercase tracking-wide">Motivo de rechazo</p>
                      <p className="text-sm text-rose-700">{data.motivo_rechazo || empresa.motivo_rechazo}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmpresaCard;
