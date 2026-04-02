import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../../../config/apiConfig';

const TIPO_BADGE = {
  POST: { bg: '#dcfce7', color: '#166534' },
  PUT: { bg: '#dbeafe', color: '#1e40af' },
  DELETE: { bg: '#fee2e2', color: '#991b1b' },
  GET: { bg: '#f1f5f9', color: '#475569' },
};

const AuditoriaSection = () => {
  const token = localStorage.getItem('access_token');

  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    tipo: '',
    accion: '',
    entidad: '',
    id_admin: '',
    fechaInicio: '',
    fechaFin: '',
    limite: '100',
  });
  const [expanded, setExpanded] = useState(null);

  const fetchAuditoria = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await fetch(`${API_URL}/auditoria?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRegistros(Array.isArray(data.data) ? data.data : []);
      } else {
        setError(data.message || 'Error al cargar auditoría.');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  }, [filtros, token]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAuditoria(); }, []);

  const handleBuscar = (e) => {
    e.preventDefault();
    fetchAuditoria();
  };

  const handleReset = () => {
    setFiltros({ tipo: '', accion: '', entidad: '', id_admin: '', fechaInicio: '', fechaFin: '', limite: '100' });
  };

  const inputStyle = { border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Registro de Auditoría</h2>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Historial completo de operaciones del sistema con filtros avanzados.</p>
      </div>

      {/* Filtros */}
      <form onSubmit={handleBuscar} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label style={labelStyle}>Tipo HTTP</label>
            <select value={filtros.tipo} onChange={e => setFiltros(p => ({ ...p, tipo: e.target.value }))} style={inputStyle}>
              <option value="">Todos</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="GET">GET</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Acción</label>
            <input value={filtros.accion} onChange={e => setFiltros(p => ({ ...p, accion: e.target.value }))} placeholder="Ej. crear_evento" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Entidad</label>
            <input value={filtros.entidad} onChange={e => setFiltros(p => ({ ...p, entidad: e.target.value }))} placeholder="Ej. usuario, empresa" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>ID Responsable</label>
            <input type="number" value={filtros.id_admin} onChange={e => setFiltros(p => ({ ...p, id_admin: e.target.value }))} placeholder="ID usuario" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Fecha inicio</label>
            <input type="date" value={filtros.fechaInicio} onChange={e => setFiltros(p => ({ ...p, fechaInicio: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Fecha fin</label>
            <input type="date" value={filtros.fechaFin} onChange={e => setFiltros(p => ({ ...p, fechaFin: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Límite</label>
            <select value={filtros.limite} onChange={e => setFiltros(p => ({ ...p, limite: e.target.value }))} style={inputStyle}>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="500">500</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
            Buscar
          </button>
          <button type="button" onClick={handleReset} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>
            Limpiar
          </button>
          <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '0.875rem', alignSelf: 'center' }}>
            {registros.length} registro(s)
          </span>
        </div>
      </form>

      {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Cargando...</div>}
      {error && <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#991b1b', marginBottom: '1rem' }}>{error}</div>}

      {!loading && !error && registros.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', backgroundColor: 'white', borderRadius: '10px' }}>No hay registros con los filtros aplicados.</div>
      )}

      {!loading && registros.length > 0 && (
        <div style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#374151', width: '140px' }}>Fecha / Hora</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#374151', width: '60px' }}>Tipo</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#374151', width: '160px' }}>Acción</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#374151', width: '100px' }}>Entidad</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Mensaje</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#374151', width: '80px' }}>Datos</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r, i) => {
                const badge = TIPO_BADGE[r.tipo] || TIPO_BADGE.GET;
                const isOpen = expanded === r.id;
                const hasDatos = r.datos_anteriores || r.datos_nuevos;
                return (
                  <React.Fragment key={r.id}>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: isOpen ? '#f8fafc' : 'white' }}>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {r.fecha} {r.hora?.slice(0, 5)}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                        <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>{r.tipo || '—'}</span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#374151', fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.accion || '—'}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#475569' }}>{r.entidad_afectada || '—'}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#374151', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.mensaje}>{r.mensaje}</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                        {hasDatos ? (
                          <button onClick={() => setExpanded(isOpen ? null : r.id)}
                            style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                            {isOpen ? '▲' : '▼'}
                          </button>
                        ) : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr style={{ backgroundColor: '#f8fafc' }}>
                        <td colSpan={6} style={{ padding: '0.75rem 1rem 1rem 1rem', borderBottom: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {r.datos_anteriores && (
                              <div>
                                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Datos anteriores</p>
                                <pre style={{ margin: 0, fontSize: '0.75rem', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', padding: '0.5rem', overflow: 'auto', maxHeight: '150px', color: '#92400e' }}>
                                  {JSON.stringify(r.datos_anteriores, null, 2)}
                                </pre>
                              </div>
                            )}
                            {r.datos_nuevos && (
                              <div>
                                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Datos nuevos</p>
                                <pre style={{ margin: 0, fontSize: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '0.5rem', overflow: 'auto', maxHeight: '150px', color: '#166534' }}>
                                  {JSON.stringify(r.datos_nuevos, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                          {r.ip_address && (
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>IP: {r.ip_address} — Usuario ID: {r.id_admin || '—'}</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditoriaSection;
