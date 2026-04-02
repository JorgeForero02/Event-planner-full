import React, { useState, useEffect } from 'react';
import GerenteSidebar from '../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import Header from '../../layouts/Header/header';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config/apiConfig';

const CAMPOS_EDITABLES = [
  { key: 'nombre', label: 'Nombre de la empresa', type: 'text' },
  { key: 'direccion', label: 'Dirección', type: 'text' },
  { key: 'telefono', label: 'Teléfono', type: 'text' },
  { key: 'correo', label: 'Correo electrónico', type: 'email' },
];

const ESTADO_BADGE = {
  pendiente: { bg: '#fef9c3', color: '#854d0e', label: 'Pendiente' },
  aprobada: { bg: '#dcfce7', color: '#166534', label: 'Aprobada' },
  rechazada: { bg: '#fee2e2', color: '#991b1b', label: 'Rechazada' },
};

const SolicitudesActualizacionPage = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [datos_propuestos, setDatosPropuestos] = useState({});
  const [justificacion, setJustificacion] = useState('');
  const [alerta, setAlerta] = useState(null);

  const empresaId = user?.rolData?.id_empresa;
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (empresaId) fetchSolicitudes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId]);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/empresas/${empresaId}/solicitudes-actualizacion`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSolicitudes(Array.isArray(data.data) ? data.data : []);
    } catch {
      setAlerta({ tipo: 'error', msg: 'Error al cargar solicitudes.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCampoChange = (key, value) => {
    setDatosPropuestos(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!justificacion.trim()) {
      setAlerta({ tipo: 'error', msg: 'La justificación es obligatoria.' });
      return;
    }
    if (Object.keys(datos_propuestos).filter(k => datos_propuestos[k]?.trim()).length === 0) {
      setAlerta({ tipo: 'error', msg: 'Debe proponer al menos un campo a modificar.' });
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/empresas/${empresaId}/solicitudes-actualizacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ datos_propuestos, justificacion })
      });
      const data = await res.json();
      if (data.success) {
        setAlerta({ tipo: 'success', msg: 'Solicitud enviada. Quedará pendiente de revisión.' });
        setShowForm(false);
        setDatosPropuestos({});
        setJustificacion('');
        fetchSolicitudes();
      } else {
        setAlerta({ tipo: 'error', msg: data.message || 'Error al enviar solicitud.' });
      }
    } catch {
      setAlerta({ tipo: 'error', msg: 'Error de conexión.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <GerenteSidebar onToggle={setSidebarCollapsed} />
      <div style={{ flex: 1, marginLeft: sidebarCollapsed ? '64px' : '256px', transition: 'margin-left 0.3s', display: 'flex', flexDirection: 'column' }}>
        <Header isSidebarCollapsed={sidebarCollapsed} />
        <main style={{ flex: 1, padding: '2rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Solicitudes de Actualización</h1>
              <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>Solicita cambios en los datos de tu empresa al administrador.</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              {showForm ? '✕ Cancelar' : '+ Nueva solicitud'}
            </button>
          </div>

          {alerta && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: alerta.tipo === 'success' ? '#dcfce7' : '#fee2e2', color: alerta.tipo === 'success' ? '#166534' : '#991b1b', fontSize: '0.875rem' }}>
              {alerta.msg}
              <button onClick={() => setAlerta(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 1rem', color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>Nuevos valores propuestos</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {CAMPOS_EDITABLES.map(campo => (
                  <div key={campo.key}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{campo.label}</label>
                    <input
                      type={campo.type}
                      value={datos_propuestos[campo.key] || ''}
                      onChange={e => handleCampoChange(campo.key, e.target.value)}
                      placeholder={`Nuevo valor para ${campo.label.toLowerCase()}`}
                      style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Justificación <span style={{ color: '#dc2626' }}>*</span></label>
                <textarea
                  value={justificacion}
                  onChange={e => setJustificacion(e.target.value)}
                  rows={3}
                  placeholder="Explica por qué solicitas este cambio..."
                  required
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" disabled={submitting} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '0.6rem 1.5rem', cursor: 'pointer', fontWeight: 600, opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </form>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Cargando...</div>
          ) : solicitudes.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem', backgroundColor: 'white', borderRadius: '10px' }}>No hay solicitudes registradas.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {solicitudes.map(s => {
                const badge = ESTADO_BADGE[s.estado] || ESTADO_BADGE.pendiente;
                return (
                  <div key={s.id} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {new Date(s.fecha_solicitud).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: '99px' }}>{badge.label}</span>
                    </div>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#374151' }}><strong>Justificación:</strong> {s.justificacion}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {s.datos_propuestos && Object.entries(s.datos_propuestos).filter(([, v]) => v).map(([k, v]) => (
                        <span key={k} style={{ backgroundColor: '#f1f5f9', borderRadius: '4px', padding: '2px 8px', fontSize: '0.8rem', color: '#475569' }}>
                          <strong>{k}:</strong> {v}
                        </span>
                      ))}
                    </div>
                    {s.estado === 'rechazada' && s.motivo_rechazo && (
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#991b1b' }}><strong>Motivo de rechazo:</strong> {s.motivo_rechazo}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SolicitudesActualizacionPage;
