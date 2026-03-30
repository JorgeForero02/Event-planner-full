import React from 'react';
import { Building2, Hash, MapPin, Phone, Mail, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

const EmpresaCard = ({ 
  empresa, 
  status = 'aprobada',
  onApprove,
  onReject,
  showActions = false 
}) => {
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

  return (
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

      {showActions && (
        <CardFooter className="pt-2 border-t mt-auto flex flex-col sm:flex-row gap-2">
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
        </CardFooter>
      )}
    </Card>
  );
};

export default EmpresaCard;
