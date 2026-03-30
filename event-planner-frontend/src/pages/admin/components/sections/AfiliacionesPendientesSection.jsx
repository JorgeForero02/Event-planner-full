import React, { useState, useEffect } from 'react';
import { useEmpresas } from '../../../../hooks/useEmpresas';
import { useNotifications } from '../../../../hooks/useNotifications';
import EmpresaCard from '../sections/EmpresaCard';
import { Search, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';

const AfiliacionesPendientesSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', 
    empresa: null,
    motivo: ''
  });

  const { empresas, loading, error, fetchEmpresas, handleAprobarEmpresa, handleRechazarEmpresa } = useEmpresas();
  const { notification, showNotification } = useNotifications();

  useEffect(() => {
    fetchEmpresas('empresas/pendientes');
  }, [fetchEmpresas]);

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nit?.includes(searchTerm)
  );

  const cleanNotificationMessage = (message) => {
    if (!message) return 'Error en el sistema';

    return message
      .replace(/http:\/\/localhost:\d+/g, 'el sistema')
      .replace(/localhost:\d+/g, 'el servidor')
      .replace(/Error de conexión con el servidor/g, 'Error de conexión')
      .replace(/Error al cargar empresas/g, 'Error al cargar la información');
  };

  const handleApproveClick = (empresa) => {
    setModal({
      isOpen: true,
      type: 'approve',
      empresa: empresa,
      motivo: ''
    });
  };

  const handleRejectClick = (empresa) => {
    setModal({
      isOpen: true,
      type: 'reject',
      empresa: empresa,
      motivo: ''
    });
  };

  const confirmApprove = async () => {
    if (!modal.empresa) return;

    try {
      await handleAprobarEmpresa(modal.empresa.id, modal.empresa.nombre, modal.empresa.id_creador);                                                                   
      showNotification('success', `Empresa "${modal.empresa.nombre}" aprobada exitosamente`);                                                                      
      fetchEmpresas('empresas/pendientes');
    } catch (error) {
      const cleanError = cleanNotificationMessage(error.message || 'Error al aprobar empresa');                                                                       
      showNotification('error', cleanError);
    } finally {
      closeModal();
    }
  };

  const confirmReject = async () => {
    if (!modal.empresa || !modal.motivo.trim()) {
      showNotification('error', 'Debe proporcionar un motivo para el rechazo');
      return;
    }

    try {
      await handleRechazarEmpresa(modal.empresa.id, modal.empresa.nombre, modal.motivo);                                                                              
      showNotification('success', `Empresa "${modal.empresa.nombre}" rechazada`);                                                                                  
      fetchEmpresas('empresas/pendientes');
    } catch (error) {
      const cleanError = cleanNotificationMessage(error.message || 'Error al rechazar empresa');                                                                      
      showNotification('error', cleanError);
    } finally {
      closeModal();
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', empresa: null, motivo: '' });
  };

  const handleRetry = () => {
    fetchEmpresas('empresas/pendientes');
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`p-4 rounded-md flex items-center gap-3 ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
          <p className="flex-1">{notification.message}</p>
          <button onClick={() => showNotification(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {modal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-modal w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>                                                                                        
            {modal.type === 'approve' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Confirmar Aprobación</h3>
                </div>

                <div className="mb-6 text-slate-600">
                  <p>¿Está seguro de aprobar la empresa <strong className="text-slate-900">"{modal.empresa?.nombre}"</strong>?</p>                                                                           
                  <p className="text-sm mt-2 text-slate-500">Esta acción no se puede deshacer.</p>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button variant="outline" onClick={closeModal}>Cancelar</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={confirmApprove}>Aprobar</Button>
                </div>
              </>
            )}

            {modal.type === 'reject' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-rose-100 rounded-full text-rose-600">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Confirmar Rechazo</h3>
                </div>

                <div className="mb-6">
                  <p className="text-slate-600 mb-2">¿Por qué rechaza la empresa <strong className="text-slate-900">"{modal.empresa?.nombre}"</strong>?</p>                                                                                  
                  <textarea
                    className="w-full min-h-[100px] p-3 border rounded-md focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                    placeholder="Ingrese el motivo del rechazo..."
                    value={modal.motivo}
                    onChange={(e) => setModal(prev => ({ ...prev, motivo: e.target.value }))}                                                                                       
                    rows="4"
                  />
                  <p className="text-sm text-slate-500 mt-2">Esta acción notificará al solicitante y no se puede deshacer.</p>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button variant="outline" onClick={closeModal}>Cancelar</Button>
                  <Button variant="destructive" onClick={confirmReject} disabled={!modal.motivo.trim()}>Rechazar</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Afiliaciones Pendientes</h1>
      </div>

      {filteredEmpresas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span className="font-medium">
            Solicitudes de Afiliación Pendientes ({filteredEmpresas.length})
          </span>
        </div>
      )}

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          type="text"
          placeholder="Buscar por nombre o NIT"
          className="pl-9 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border-rose-200 text-rose-800 rounded-lg flex items-center justify-between">
          <p>{cleanNotificationMessage(error)}</p>
          <Button variant="outline" size="sm" onClick={handleRetry} className="bg-white">Reintentar</Button>
        </div>
      )}

      {loading && (
        <div className="h-32 flex items-center justify-center text-slate-500">Cargando empresas...</div>
      )}

      {!loading && filteredEmpresas.length === 0 && (
        <div className="h-48 bg-white border border-dashed rounded-lg flex flex-col items-center justify-center text-slate-500 space-y-3">
          <Info className="w-8 h-8 text-slate-400" />
          <p>{searchTerm ? 'No se encontraron empresas con ese criterio' : 'No hay solicitudes pendientes'}</p>                                                         
        </div>
      )}

      {!loading && filteredEmpresas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmpresas.map((empresa) => (
            <EmpresaCard
              key={empresa.id}
              empresa={empresa}
              status="pendiente"
              showActions={true}
              onApprove={() => handleApproveClick(empresa)}
              onReject={() => handleRejectClick(empresa)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AfiliacionesPendientesSection;
