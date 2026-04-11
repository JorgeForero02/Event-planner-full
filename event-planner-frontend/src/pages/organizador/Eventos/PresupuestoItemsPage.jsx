import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../../config/apiConfig';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';

const TIPO_COLORS = {
  ingreso: { bg: '#dcfce7', color: '#166534', label: 'Ingreso' },
  gasto: { bg: '#fee2e2', color: '#991b1b', label: 'Gasto' },
};

const PresupuestoItemsPage = () => {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  const [data, setData] = useState({ items: [], resumen: { total_ingresos: '0.00', total_gastos: '0.00', balance: '0.00' } });
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [form, setForm] = useState({ concepto: '', monto: '', tipo: 'gasto', id_actividad: '', descripcion: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    Promise.all([fetchItems(), fetchActividades()]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventoId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/eventos/${eventoId}/presupuesto-items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
      setAlerta({ tipo: 'error', msg: 'Error al cargar ítems de presupuesto.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchActividades = async () => {
    try {
      const res = await fetch(`${API_URL}/eventos/${eventoId}/actividades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) setActividades(Array.isArray(json.data) ? json.data : []);
    } catch {}
  };

  const resetForm = () => {
    setForm({ concepto: '', monto: '', tipo: 'gasto', id_actividad: '', descripcion: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.concepto.trim() || !form.monto || !form.tipo) {
      setAlerta({ tipo: 'error', msg: 'Concepto, monto y tipo son obligatorios.' });
      return;
    }
    try {
      setSubmitting(true);
      const url = editingId
        ? `${API_URL}/eventos/${eventoId}/presupuesto-items/${editingId}`
        : `${API_URL}/eventos/${eventoId}/presupuesto-items`;
      const method = editingId ? 'PUT' : 'POST';
      const body = {
        concepto: form.concepto,
        monto: parseFloat(form.monto),
        tipo: form.tipo,
        id_actividad: form.id_actividad ? parseInt(form.id_actividad) : null,
        descripcion: form.descripcion || undefined
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (json.success) {
        setAlerta({ tipo: 'success', msg: editingId ? 'Ítem actualizado.' : 'Ítem registrado.' });
        resetForm();
        fetchItems();
      } else {
        setAlerta({ tipo: 'error', msg: json.message || 'Error al guardar.' });
      }
    } catch {
      setAlerta({ tipo: 'error', msg: 'Error de conexión.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      concepto: item.concepto,
      monto: item.monto,
      tipo: item.tipo,
      id_actividad: item.id_actividad || '',
      descripcion: item.descripcion || ''
    });
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmarDelete = async () => {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`${API_URL}/eventos/${eventoId}/presupuesto-items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setAlerta({ tipo: 'success', msg: 'Ítem eliminado.' });
        fetchItems();
      } else {
        setAlerta({ tipo: 'error', msg: json.message || 'Error al eliminar.' });
      }
    } catch {
      setAlerta({ tipo: 'error', msg: 'Error de conexión.' });
    }
  };

  const balance = Number(data.resumen?.balance || 0);

  return (
    <>
    <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600">¿Eliminar este ítem de presupuesto?</p>
        <DialogFooter>
          <button onClick={() => setConfirmDeleteId(null)} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.4rem 0.75rem', cursor: 'pointer', color: '#374151', fontSize: '0.875rem' }}>Cancelar</button>
          <button onClick={confirmarDelete} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>Eliminar</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.4rem 0.75rem', cursor: 'pointer', color: '#374151', fontSize: '0.875rem' }}>
            ← Volver
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>Gestión de Presupuesto</h1>
            <p style={{ margin: '0.2rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>Registra ingresos y gastos del evento.</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ concepto: '', monto: '', tipo: 'gasto', id_actividad: '', descripcion: '' }); }}
            style={{ marginLeft: 'auto', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
            {showForm ? '✕ Cancelar' : '+ Nuevo ítem'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Ingresos', value: `$${Number(data.resumen?.total_ingresos || 0).toLocaleString()}`, color: '#059669' },
            { label: 'Total Gastos', value: `$${Number(data.resumen?.total_gastos || 0).toLocaleString()}`, color: '#dc2626' },
            { label: 'Balance', value: `$${balance.toLocaleString()}`, color: balance >= 0 ? '#059669' : '#dc2626' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '1rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {alerta && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: alerta.tipo === 'success' ? '#dcfce7' : '#fee2e2', color: alerta.tipo === 'success' ? '#166534' : '#991b1b', fontSize: '0.875rem' }}>
            {alerta.msg}
            <button onClick={() => setAlerta(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>{editingId ? 'Editar ítem' : 'Nuevo ítem de presupuesto'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Concepto <span style={{ color: '#dc2626' }}>*</span></label>
                <input value={form.concepto} onChange={e => setForm(p => ({ ...p, concepto: e.target.value }))} required
                  placeholder="Ej. Alquiler de salón, patrocinio empresa X..."
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Monto <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="number" min="0" step="0.01" value={form.monto} onChange={e => setForm(p => ({ ...p, monto: e.target.value }))} required
                  placeholder="0.00"
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Tipo <span style={{ color: '#dc2626' }}>*</span></label>
                <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', boxSizing: 'border-box' }}>
                  <option value="gasto">Gasto</option>
                  <option value="ingreso">Ingreso</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Actividad (opcional)</label>
                <select value={form.id_actividad} onChange={e => setForm(p => ({ ...p, id_actividad: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', boxSizing: 'border-box' }}>
                  <option value="">— Sin actividad específica —</option>
                  {actividades.map(a => (
                    <option key={a.id_actividad} value={a.id_actividad}>{a.titulo}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Descripción (opcional)</label>
                <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={2}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={submitting} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '0.6rem 1.5rem', cursor: 'pointer', fontWeight: 600, opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Registrar'}
              </button>
              <button type="button" onClick={resetForm} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.6rem 1rem', cursor: 'pointer', color: '#374151', fontWeight: 600 }}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Cargando...</div>
        ) : data.items.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem', backgroundColor: 'white', borderRadius: '10px' }}>No hay ítems de presupuesto registrados.</div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Concepto</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Actividad</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, color: '#374151' }}>Tipo</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#374151' }}>Monto</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, color: '#374151' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, i) => {
                  const badge = TIPO_COLORS[item.tipo] || TIPO_COLORS.gasto;
                  return (
                    <tr key={item.id} style={{ borderBottom: i < data.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.concepto}</div>
                        {item.descripcion && <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '2px' }}>{item.descripcion}</div>}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>{item.actividad?.titulo || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: '99px' }}>{badge.label}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: item.tipo === 'ingreso' ? '#059669' : '#dc2626' }}>
                        ${Number(item.monto).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button onClick={() => handleEdit(item)} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Editar</button>
                          <button onClick={() => handleDelete(item.id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default PresupuestoItemsPage;
