import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { API_URL } from '../../config/apiConfig';
import styles from './afiliaciones.module.css';
import { useToast } from '../../contexts/ToastContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';

const AfiliacionesPendientes = () => {
  const toast = useToast();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingIds, setApprovingIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [confirmApprove, setConfirmApprove] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectMotivo, setRejectMotivo] = useState('');

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('No hay sesión activa');
        return;
      }

      const response = await fetch(`${API_URL}/empresas/pendientes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        return;
      }

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.data) {
          const empresasPendientes = result.data.filter(e => e.estado === 0);
          setEmpresas(empresasPendientes);
        } else {
          setEmpresas([]);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cargar empresas');
      }
    } catch {
      setError('Error de conexión con el servidor');
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  };


  const attemptFallbackPromotion = async (requesterId, empresaId, token) => {
    try {
      const promoteResp = await fetch(`${API_URL}/auth/promover-gerente`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_usuario: requesterId, id_empresa: empresaId })
      });

      if (promoteResp.ok) {
        const promoteResult = await promoteResp.json().catch(() => ({}));
        if (promoteResult.success) {
          toast.success('El usuario solicitante ha sido promovido a Gerente.');
        } else {
          toast.warning('Empresa aprobada, pero no se pudo promover al usuario solicitante.');
        }
      } else {
        toast.warning('Empresa aprobada, pero la promoción del usuario falló en el servidor.');
      }
    } catch {
      toast.warning('Empresa aprobada, pero hubo un error al promover al usuario solicitante.');
    }
  };

  const extractRequesterId = (empresa) => {
    if (!empresa) return null;
    return (
      empresa.usuario?.id ||
      empresa.usuario_id ||
      empresa.id_usuario ||
      empresa.creado_por ||
      empresa.creador_id ||
      empresa.solicitante?.id ||
      empresa.solicitante_id ||
      empresa.user_id ||
      empresa.usuario_solicitante?.id ||
      empresa.solicitante_usuario_id ||
      null
    );
  };

  const fetchEmpresaById = async (empresaId) => {
    try {
      const token = localStorage.getItem('access_token');
      const resp = await fetch(`${API_URL}/empresas/${empresaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!resp.ok) return null;

      const json = await resp.json().catch(() => null);
      return json?.data || null;
    } catch {
      return null;
    }
  };

  const handleApprove = (id, nombre) => {
    setConfirmApprove({ id, nombre });
  };

  const confirmarApprove = async () => {
    const { id } = confirmApprove;
    setConfirmApprove(null);

    if (approvingIds.includes(id)) return;
    setApprovingIds(prev => [...prev, id]);

    try {
      const result = await adminService.aprobarEmpresaYPromover(id);
      toast.success('Empresa aprobada exitosamente');
      if (result?.promote?.success) {
        toast.success('El usuario solicitante ha sido promovido a Gerente.');
      }
      setEmpresas(prev => prev.filter(e => e.id !== id));
      fetchEmpresas();
    } catch (error) {
      toast.error(error.message || 'Error al aprobar empresa');
      fetchEmpresas();
    } finally {
      setApprovingIds(prev => prev.filter(x => x !== id));
    }
  };

  const handleReject = (id, nombre) => {
    setRejectTarget({ id, nombre });
    setRejectMotivo('');
  };

  const confirmarReject = async () => {
    if (!rejectMotivo.trim()) {
      toast.warning('Debes proporcionar un motivo para el rechazo');
      return;
    }
    const { id } = rejectTarget;
    setRejectTarget(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/empresas/${id}/aprobar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ aprobar: false, motivo: rejectMotivo })
      });

      if (response.ok) {
        toast.success('Empresa rechazada');
        fetchEmpresas();
      } else {
        const result = await response.json();
        toast.error(result.message || 'Error al rechazar empresa');
      }
    } catch {
      toast.error('Error al rechazar empresa');
    }
  };

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nit?.includes(searchTerm)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Afiliaciones Pendientes</h1>
      </div>

      {filteredEmpresas.length > 0 && (
        <div className={styles.alertBanner}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.alertIcon}>
            <circle cx="12" cy="12" r="10" stroke="#ff9800" strokeWidth="2" fill="none" />
            <path d="M12 8v4M12 16h.01" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className={styles.alertText}>
            Solicitudes de Afiliación Pendientes ({filteredEmpresas.length})
          </span>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar por nombre o NIT"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.searchIcon}>
            <circle cx="8" cy="8" r="6" stroke="#757575" strokeWidth="2" />
            <path d="M13 13l5 5" stroke="#757575" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={fetchEmpresas} className={styles.btnRetry}>
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Cargando empresas...</div>
      ) : filteredEmpresas.length === 0 ? (
        <div className={styles.noResults}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin: '0 auto 16px' }}>
            <circle cx="32" cy="32" r="30" stroke="#ddd" strokeWidth="2" fill="none" />
            <path d="M32 20v16M32 44h.01" stroke="#ddd" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p>{searchTerm ? 'No se encontraron empresas con ese criterio' : 'No hay solicitudes pendientes'}</p>
        </div>
      ) : (
        <div className={styles.empresasList}>
          {filteredEmpresas.map((empresa) => (
            <div key={empresa.id} className={styles.empresaCard}>
              <div className={styles.empresaInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Nombre Empresa</span>
                  <span className={styles.value}>{empresa.nombre}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>NIT</span>
                  <span className={styles.value}>{empresa.nit}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Dirección</span>
                  <span className={styles.value}>{empresa.direccion}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Teléfono</span>
                  <span className={styles.value}>{empresa.telefono}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Email</span>
                  <span className={styles.value}>{empresa.correo || empresa.email}</span>
                </div>
              </div>

              <div className={styles.empresaActions}>
                <button
                  className={styles.btnAprobar}
                  onClick={() => handleApprove(empresa.id, empresa.nombre)}
                  disabled={approvingIds.includes(empresa.id)}
                >
                  {approvingIds.includes(empresa.id) ? 'Procesando...' : '✓ Aprobar'}
                </button>
                <button
                  className={styles.btnRechazar}
                  onClick={() => handleReject(empresa.id, empresa.nombre)}
                  disabled={approvingIds.includes(empresa.id)}
                >
                  {approvingIds.includes(empresa.id) ? 'Procesando...' : '✗ Rechazar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!confirmApprove} onOpenChange={(open) => !open && setConfirmApprove(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar aprobación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">¿Aprobar la empresa "{confirmApprove?.nombre}"? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmApprove(null)}>Cancelar</Button>
            <Button onClick={confirmarApprove}>Aprobar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rechazar empresa</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Motivo del rechazo *</Label>
            <Textarea
              value={rejectMotivo}
              onChange={(e) => setRejectMotivo(e.target.value)}
              placeholder={`¿Por qué rechazas la empresa "${rejectTarget?.nombre}"?`}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmarReject}>Rechazar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AfiliacionesPendientes;