import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/apiConfig';

const CatalogoEventos = () => {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroModalidad, setFiltroModalidad] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchEventos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroModalidad]);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroModalidad) params.append('modalidad', filtroModalidad);
      const res = await fetch(`${API_URL}/inscripciones/eventos-disponibles?${params}`);
      const data = await res.json();
      setEventos(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError('No se pudieron cargar los eventos. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const eventosFiltrados = eventos.filter(e =>
    !busqueda ||
    e.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const badgeColor = (modalidad) => {
    if (!modalidad) return '#6b7280';
    return modalidad === 'presencial' ? '#2563eb' : modalidad === 'virtual' ? '#7c3aed' : '#059669';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>

      <header style={{ backgroundColor: '#1e293b', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Catálogo de Eventos</h1>
        <button
          onClick={() => navigate('/login')}
          style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
        >
          Iniciar sesión
        </button>
      </header>

      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar evento..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.9rem', width: '260px' }}
        />
        <select
          value={filtroModalidad}
          onChange={e => setFiltroModalidad(e.target.value)}
          style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
        >
          <option value="">Todas las modalidades</option>
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
          <option value="hibrido">Híbrido</option>
        </select>
        <span style={{ color: '#6b7280', fontSize: '0.875rem', marginLeft: 'auto' }}>
          {eventosFiltrados.length} evento(s) disponible(s)
        </span>
      </div>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Cargando eventos...</div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>{error}</div>
        )}
        {!loading && !error && eventosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            No hay eventos disponibles en este momento.
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {eventosFiltrados.map(evento => (
            <div key={evento.id} style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', overflow: 'hidden', transition: 'transform 0.15s', border: '1px solid #e2e8f0' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.4, flex: 1 }}>{evento.titulo}</h3>
                  {evento.modalidad && (
                    <span style={{ marginLeft: '0.75rem', backgroundColor: badgeColor(evento.modalidad), color: 'white', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                      {evento.modalidad}
                    </span>
                  )}
                </div>
                {evento.descripcion && (
                  <p style={{ margin: '0 0 0.75rem', color: '#4b5563', fontSize: '0.875rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {evento.descripcion}
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {formatFecha(evento.fecha_inicio)} — {formatFecha(evento.fecha_fin)}
                  </span>
                  {evento.hora && (
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{evento.hora}</span>
                  )}
                  {evento.cupos !== undefined && (
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{evento.cupos} cupos</span>
                  )}
                  {evento.empresa?.nombre && (
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{evento.empresa.nombre}</span>
                  )}
                </div>
                <button
                  onClick={() => navigate('/login')}
                  style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                >
                  Inscribirme
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CatalogoEventos;
