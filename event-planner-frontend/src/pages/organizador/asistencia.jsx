import React, { useState, useEffect } from 'react';
import { Search, Users, AlertCircle, UserCheck, UserX, Download } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import Sidebar from './Sidebar';
import asistenciaService from '../../components/asistenciaService';
import DataTable from '../../components/ui/DataTable';
import { Button } from '../../components/ui/button';

export default function GestionAsistentes() {
    const [eventos, setEventos] = useState([]);
    const [selectedEventoId, setSelectedEventoId] = useState(null);
    const [asistentes, setAsistentes] = useState([]);
    const [filteredAsistentes, setFilteredAsistentes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarEventos = async () => {
            setLoading(true);
            try {
                const ev = await asistenciaService.obtenerEventos();
                const lista = Array.isArray(ev) ? ev : (ev.data || []);
                setEventos(lista);

                if (lista.length > 0) {
                    setSelectedEventoId(String(lista[0].id || lista[0]._id || lista[0].id_evento));
                }
                setError(null);
            } catch {
                setError('No se pudo cargar la lista de eventos.');
            } finally {
                setLoading(false);
            }
        };

        cargarEventos();
    }, []);

    useEffect(() => {
        if (!selectedEventoId) return;
        cargarAsistentes(selectedEventoId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEventoId]);

    const cargarAsistentes = async (idEvento) => {
        setLoading(true);
        setError(null);
        try {
            const response = await asistenciaService.obtenerAsistenciasEvento(idEvento);

            const info = response.data || {};
            const lista = info.inscripciones || [];

            const normalizados = lista.map((inscripcion, idx) => {
                const usuario = inscripcion.asistente?.usuario || {};
                const nombre = usuario.nombre ||
                    inscripcion.nombre ||
                    `${inscripcion.nombres || ''} ${inscripcion.apellidos || ''}`.trim() ||
                    'Sin nombre';

                const email = usuario.correo ||
                    usuario.email ||
                    inscripcion.email ||
                    inscripcion.correo ||
                    '—';

                const iniciales = nombre.split(' ')
                    .filter(n => n.length > 0)
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || '—';

                return {
                    id: String(inscripcion.id || inscripcion._id || inscripcion.codigo || idx + 1),
                    codigo: inscripcion.codigo || '—',
                    nombre: nombre,
                    email: email,
                    cedula: usuario.cedula || '—',
                    fechaRegistro: inscripcion.fecha || inscripcion.fecha_registro || inscripcion.createdAt || '—',
                    estado: inscripcion.estado || 'Pendiente',
                    iniciales: iniciales,
                    color: inscripcion.color || generarColorAleatorio()
                };
            });

            setAsistentes(normalizados);
            setFilteredAsistentes(normalizados);

        } catch {
            setError('Error al cargar asistentes.');
            setAsistentes([]);
            setFilteredAsistentes([]);
        } finally {
            setLoading(false);
        }
    };

    const generarColorAleatorio = () => {
        const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
        return colores[Math.floor(Math.random() * colores.length)];
    };

    useEffect(() => {
        let filtered = asistentes;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(a =>
                a.nombre.toLowerCase().includes(term) ||
                (a.email || '').toLowerCase().includes(term) ||
                a.id.toLowerCase().includes(term) ||
                (a.cedula || '').toLowerCase().includes(term)
            );
        }

        if (filtroEstado !== 'todos') {
            filtered = filtered.filter(a => a.estado.toLowerCase() === filtroEstado.toLowerCase());
        }

        setFilteredAsistentes(filtered);
    }, [searchTerm, filtroEstado, asistentes]);

    const [loadingAsistencia, setLoadingAsistencia] = useState({});
    const [exportingCSV, setExportingCSV] = useState(false);

    const totalInscritos = asistentes.length;
    const confirmados = asistentes.filter(a => a.estado.toLowerCase() === 'confirmado' || a.estado.toLowerCase() === 'confirmada').length;
    const pendientes = asistentes.filter(a => a.estado.toLowerCase() === 'pendiente').length;
    const ausentes = asistentes.filter(a => a.estado.toLowerCase() === 'ausente').length;

    const actualizarAsistencia = async (idAsistencia, nuevoEstado) => {
        setLoadingAsistencia(prev => ({ ...prev, [idAsistencia]: nuevoEstado }));
        try {
            await asistenciaService.actualizarAsistenciaManual(idAsistencia, nuevoEstado);
            await cargarAsistentes(selectedEventoId);
        } catch {
            setError('No se pudo actualizar la asistencia.');
        } finally {
            setLoadingAsistencia(prev => { const s = { ...prev }; delete s[idAsistencia]; return s; });
        }
    };

    const handleExportarCSV = async () => {
        if (!selectedEventoId) return;
        setExportingCSV(true);
        try {
            const response = await asistenciaService.exportarInscritosCSV(selectedEventoId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const eventoActual = eventos.find(e => String(e.id || e._id) === String(selectedEventoId));
            link.setAttribute('download', `inscritos_${eventoActual?.titulo || selectedEventoId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            setError('Error al exportar el CSV.');
        } finally {
            setExportingCSV(false);
        }
    };

    const columns = [
        {
            key: 'id',
            label: 'ID',
            render: (val) => <span className="text-slate-500 font-mono text-xs">#{val}</span>,
        },
        {
            key: 'nombre',
            label: 'Participante',
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                        style={{ backgroundColor: row.color }}
                    >
                        {row.iniciales}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-800">{row.nombre}</p>
                        <p className="text-xs text-slate-500">{row.email}</p>
                    </div>
                </div>
            ),
        },
        { key: 'fechaRegistro', label: 'Fecha Registro' },
        {
            key: 'estado',
            label: 'Estado',
            render: (val) => <StatusBadge status={val} />,
        },
        {
            key: 'acciones',
            label: 'Asistencia',
            render: (_, row) => {
                const isLoading = loadingAsistencia[row.id];
                return (
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => actualizarAsistencia(row.id, 'confirmado')}
                            disabled={!!isLoading}
                            title="Marcar Asistió"
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                        >
                            <UserCheck size={13} />
                            {isLoading === 'confirmado' ? '...' : 'Asistió'}
                        </button>
                        <button
                            onClick={() => actualizarAsistencia(row.id, 'ausente')}
                            disabled={!!isLoading}
                            title="Marcar No asistió"
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 disabled:opacity-50 transition-colors"
                        >
                            <UserX size={13} />
                            {isLoading === 'ausente' ? '...' : 'No asistió'}
                        </button>
                    </div>
                );
            },
        },
    ];

    if (loading && eventos.length === 0) {
        return (
            <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center ml-[280px]">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                        <div className="w-8 h-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
                        <p className="text-sm">Cargando...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 overflow-auto p-6 space-y-6 ml-[280px]">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestión de Inscritos</h1>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-0.5">Seleccionar evento</h3>
                    <p className="text-xs text-slate-500 mb-3">Elige el evento para ver los inscritos</p>
                    <select
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-colors"
                        value={selectedEventoId || ''}
                        onChange={(e) => setSelectedEventoId(e.target.value)}
                    >
                        <option value="">-- Seleccione un evento --</option>
                        {eventos.map(ev => (
                            <option
                                key={ev.id || ev._id || ev.codigo}
                                value={String(ev.id || ev._id || ev.codigo)}
                            >
                                {ev.titulo || ev.nombre || ev.title || `Evento ${ev.id || ev._id}`}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {selectedEventoId && (
                    <h2 className="text-lg font-semibold text-slate-800">
                        {(() => {
                            const ev = eventos.find(e =>
                                String(e.id || e._id || e.codigo) === String(selectedEventoId)
                            );
                            return ev ? (ev.titulo || ev.nombre || ev.title) : 'Evento seleccionado';
                        })()}
                    </h2>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Total Inscritos</p>
                        <p className="text-2xl font-bold text-brand-600">{totalInscritos}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Confirmados</p>
                        <p className="text-2xl font-bold text-success">{confirmados}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Pendientes</p>
                        <p className="text-2xl font-bold text-warning">{pendientes}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Ausentes</p>
                        <p className="text-2xl font-bold text-danger">{ausentes}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email, cédula o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-colors"
                        />
                    </div>
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-colors"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="ausente">Ausente</option>
                    </select>
                    <Button
                        variant="outline"
                        onClick={handleExportarCSV}
                        disabled={!selectedEventoId || exportingCSV || asistentes.length === 0}
                        className="gap-2 shrink-0"
                    >
                        <Download size={14} />
                        {exportingCSV ? 'Exportando...' : 'Exportar CSV'}
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredAsistentes}
                    loading={loading}
                    emptyState={{
                        icon: Users,
                        title: 'Sin asistentes',
                        description: 'No se encontraron asistentes con los filtros aplicados.',
                    }}
                />
            </div>
        </div>
    );
}
