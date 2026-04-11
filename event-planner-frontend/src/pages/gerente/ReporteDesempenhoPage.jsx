import React, { useState, useEffect } from 'react';
import GerenteSidebar from '../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import Header from '../../layouts/Header/header';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config/apiConfig';

const StatCard = ({ titulo, valor, subtitulo, color = '#2563eb' }) => (
  <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
    <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{titulo}</p>
    <p style={{ margin: '0 0 0.25rem', fontSize: '2rem', fontWeight: 800, color }}>{valor}</p>
    {subtitulo && <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>{subtitulo}</p>}
  </div>
);

const ESTADO_LABELS = { 0: 'Programado', 1: 'Activo', 2: 'Finalizado', 3: 'Cancelado' };
const ESTADO_COLORS = { 0: '#6b7280', 1: '#2563eb', 2: '#059669', 3: '#dc2626' };

const ReporteDesempenhoPage = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({ fechaInicio: '', fechaFin: '', estado: '' });
  const [exportLoading, setExportLoading] = useState(false);

  const empresaId = user?.rolData?.id_empresa;
  const token = localStorage.getItem('access_token');

  const fetchReporte = async () => {
    if (!empresaId) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
      if (filtros.estado !== '') params.append('estado', filtros.estado);
      const res = await fetch(`${API_URL}/empresas/${empresaId}/reporte-desempenho?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setReporte(data.data);
      else setError(data.message || 'Error al cargar reporte.');
    } catch {
      setError('Error de conexión al cargar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!empresaId || !reporte) return;
    try {
      setExportLoading(true);
      const params = new URLSearchParams();
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
      if (filtros.estado !== '') params.append('estado', filtros.estado);
      const res = await fetch(`${API_URL}/empresas/${empresaId}/reporte-desempenho/exportar-csv?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al exportar');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-desempenho-empresa-${empresaId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
    } finally {
      setExportLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchReporte(); }, [empresaId]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <GerenteSidebar onToggle={setSidebarCollapsed} />
      <div style={{ flex: 1, marginLeft: sidebarCollapsed ? '64px' : '256px', transition: 'margin-left 0.3s', display: 'flex', flexDirection: 'column' }}>
        <Header isSidebarCollapsed={sidebarCollapsed} />
        <main style={{ flex: 1, padding: '2rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Reporte de Desempeño</h1>
          <p style={{ margin: '0 0 1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>Indicadores de eventos, inscripciones, asistencia, encuestas y presupuesto de tu empresa.</p>

          <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Fecha inicio</label>
              <input type="date" value={filtros.fechaInicio} onChange={e => setFiltros(p => ({ ...p, fechaInicio: e.target.value }))}
                style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.875rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Fecha fin</label>
              <input type="date" value={filtros.fechaFin} onChange={e => setFiltros(p => ({ ...p, fechaFin: e.target.value }))}
                style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.875rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Estado evento</label>
              <select value={filtros.estado} onChange={e => setFiltros(p => ({ ...p, estado: e.target.value }))}
                style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>
                <option value="">Todos</option>
                <option value="0">Programado</option>
                <option value="1">Activo</option>
                <option value="2">Finalizado</option>
                <option value="3">Cancelado</option>
              </select>
            </div>
            <button onClick={fetchReporte} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', alignSelf: 'flex-end' }}>
              Aplicar filtros
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!reporte || exportLoading}
              style={{ backgroundColor: !reporte || exportLoading ? '#94a3b8' : '#059669', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1.25rem', cursor: !reporte || exportLoading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem', alignSelf: 'flex-end' }}
            >
              {exportLoading ? 'Exportando...' : 'Exportar CSV'}
            </button>
          </div>

          {loading && <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Cargando reporte...</div>}
          {error && <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: '8px' }}>{error}</div>}

          {reporte && !loading && (
            <>

              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.75rem' }}>Eventos</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard titulo="Total eventos" valor={reporte.total_eventos} />
                <StatCard titulo="Programados" valor={reporte.eventos_por_estado?.programados || 0} color="#6b7280" />
                <StatCard titulo="Activos" valor={reporte.eventos_por_estado?.activos || 0} color="#2563eb" />
                <StatCard titulo="Finalizados" valor={reporte.eventos_por_estado?.finalizados || 0} color="#059669" />
                <StatCard titulo="Actividades" valor={reporte.total_actividades || 0} color="#7c3aed" />
              </div>

              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.75rem' }}>Inscripciones y Asistencia</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard titulo="Total inscritos" valor={reporte.inscripciones?.total || 0} />
                <StatCard titulo="Confirmados" valor={reporte.inscripciones?.confirmadas || 0} color="#059669" />
                <StatCard titulo="Asistencias" valor={reporte.inscripciones?.asistencias || 0} color="#2563eb" />
                <StatCard titulo="Tasa asistencia" valor={`${reporte.inscripciones?.tasa_asistencia || 0}%`} color={reporte.inscripciones?.tasa_asistencia >= 70 ? '#059669' : '#d97706'} subtitulo="de inscritos confirmados" />
              </div>

              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.75rem' }}>Encuestas</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard titulo="Enviadas" valor={reporte.encuestas?.total_enviadas || 0} />
                <StatCard titulo="Completadas" valor={reporte.encuestas?.total_completadas || 0} color="#059669" />
                <StatCard titulo="Tasa respuesta" valor={`${reporte.encuestas?.tasa_respuesta || 0}%`} color={reporte.encuestas?.tasa_respuesta >= 60 ? '#059669' : '#d97706'} />
              </div>

              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.75rem' }}>Presupuesto</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard titulo="Total ingresos" valor={`$${Number(reporte.presupuesto?.total_ingresos || 0).toLocaleString()}`} color="#059669" />
                <StatCard titulo="Total gastos" valor={`$${Number(reporte.presupuesto?.total_gastos || 0).toLocaleString()}`} color="#dc2626" />
                <StatCard titulo="Balance" valor={`$${Number(reporte.presupuesto?.balance || 0).toLocaleString()}`} color={Number(reporte.presupuesto?.balance) >= 0 ? '#059669' : '#dc2626'} />
              </div>

              {reporte.eventos?.length > 0 && (
                <>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.75rem' }}>Detalle de Eventos</h2>
                  <div style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Título</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Modalidad</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Fecha</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, color: '#374151' }}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporte.eventos.map((ev, i) => (
                          <tr key={ev.id} style={{ borderBottom: i < reporte.eventos.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                            <td style={{ padding: '0.75rem 1rem', color: '#1e293b', fontWeight: 500 }}>{ev.titulo}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#6b7280', textTransform: 'capitalize' }}>{ev.modalidad || '—'}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>{new Date(ev.fecha_inicio).toLocaleDateString('es-CO')}</td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                              <span style={{ backgroundColor: ESTADO_COLORS[ev.estado] + '20', color: ESTADO_COLORS[ev.estado], fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: '99px' }}>
                                {ESTADO_LABELS[ev.estado] || ev.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ReporteDesempenhoPage;
