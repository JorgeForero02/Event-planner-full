import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Users, UserCheck, UserX, XCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Sidebar from './Sidebar';
import asistenciaService from '../../components/asistenciaService';
import './estadisticas.css';
import { useToast } from '../../contexts/ToastContext';

export default function EstadisticasAsistencia() {
    const toast = useToast();
    const [eventos, setEventos] = useState([]);
    const [selectedEventoId, setSelectedEventoId] = useState(null);
    const [estadisticas, setEstadisticas] = useState({
        totalInscritos: 0,
        confirmados: 0,
        cancelaciones: 0,
        porcentajeAsistencia: 0,
        distribucion: [],
        asistenciaPorActividad: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [exportingCSV, setExportingCSV] = useState(false);

    const statsRef = useRef();
    const chartsRef = useRef();

    useEffect(() => { cargarEventos(); }, []);
    useEffect(() => { if (selectedEventoId) cargarEstadisticas(selectedEventoId); }, [selectedEventoId]);

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

    const cargarEstadisticas = async (idEvento) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

            let reporteData = null;
            try {
                const reporteRes = await fetch(`${API_URL}/eventos/${idEvento}/reporte`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (reporteRes.ok) {
                    const json = await reporteRes.json();
                    reporteData = json.data || json;
                }
            } catch {}

            const response = await asistenciaService.obtenerAsistenciasEvento(idEvento);
            const info = response.data || {};
            const lista = info.inscripciones || [];

            const totalInscritos = reporteData?.total_inscritos ?? lista.length;
            const confirmados = reporteData?.confirmados ??
                lista.filter(i =>
                    i.estado?.toLowerCase() === 'confirmado' ||
                    i.estado?.toLowerCase() === 'confirmada'
                ).length;

            const cancelaciones = reporteData?.cancelaciones ??
                lista.filter(i =>
                    i.estado?.toLowerCase() === 'cancelado' ||
                    i.estado?.toLowerCase() === 'ausente'
                ).length;

            const porcentajeAsistencia = reporteData?.porcentaje_asistencia ??
                (totalInscritos > 0 ? ((confirmados / totalInscritos) * 100).toFixed(1) : 0);

            const distribucion = [
                { name: 'Asistentes', value: confirmados, color: '#10b981' },
                { name: 'Cancelaciones', value: cancelaciones, color: '#ef4444' }
            ];

            const asistenciaPorActividad = Array.isArray(reporteData?.actividades) && reporteData.actividades.length > 0
                ? reporteData.actividades.map(a => ({
                    nombre: a.titulo || a.nombre,
                    asistentes: a.asistentes ?? a.confirmados ?? 0,
                    inscritos: a.inscritos ?? a.total ?? 0
                }))
                : [];

            setEstadisticas({
                totalInscritos,
                confirmados,
                cancelaciones,
                porcentajeAsistencia,
                distribucion,
                asistenciaPorActividad
            });

        } catch {
            setError('Error al cargar estadísticas.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportarCSVReporte = async () => {
        if (!selectedEventoId) return;
        setExportingCSV(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
            const response = await fetch(`${API_URL}/eventos/${selectedEventoId}/reporte/exportar-csv`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al exportar');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const nombre = eventoSeleccionado?.titulo || eventoSeleccionado?.nombre || selectedEventoId;
            link.setAttribute('download', `reporte_${nombre.replace(/\s+/g, '_')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            setError('Error al exportar el CSV del reporte.');
        } finally {
            setExportingCSV(false);
        }
    };

    const generarPDF = async () => {
        if (!selectedEventoId || !eventoSeleccionado) {
            toast.warning('Selecciona un evento primero');
            return;
        }

        setGeneratingPDF(true);

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let currentY = 20;

            pdf.setFontSize(18);
            pdf.setTextColor(31, 41, 55);
            pdf.text('Reporte de Estadísticas', pageWidth / 2, currentY, { align: 'center' });
            
            currentY += 10;
            pdf.setFontSize(14);
            pdf.text(eventoSeleccionado.titulo || eventoSeleccionado.nombre, pageWidth / 2, currentY, { align: 'center' });
            
            currentY += 8;
            pdf.setFontSize(10);
            pdf.setTextColor(107, 114, 128);
            pdf.text(`Fecha: ${eventoSeleccionado.fecha_inicio || 'N/A'} | Modalidad: ${eventoSeleccionado.modalidad || 'N/A'}`, pageWidth / 2, currentY, { align: 'center' });

            currentY += 15;

            if (statsRef.current) {
                const statsCanvas = await html2canvas(statsRef.current, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });
                
                const statsImgData = statsCanvas.toDataURL('image/png');
                const statsImgWidth = pageWidth - 20;
                const statsImgHeight = (statsCanvas.height * statsImgWidth) / statsCanvas.width;

                pdf.addImage(statsImgData, 'PNG', 10, currentY, statsImgWidth, statsImgHeight);
                currentY += statsImgHeight + 10;
            }

            if (chartsRef.current) {
                if (currentY + 120 > pageHeight) {
                    pdf.addPage();
                    currentY = 20;
                }

                const chartsCanvas = await html2canvas(chartsRef.current, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });
                
                const chartsImgData = chartsCanvas.toDataURL('image/png');
                const chartsImgWidth = pageWidth - 20;
                const chartsImgHeight = (chartsCanvas.height * chartsImgWidth) / chartsCanvas.width;

                if (currentY + chartsImgHeight > pageHeight - 10) {
                    pdf.addPage();
                    currentY = 20;
                }

                pdf.addImage(chartsImgData, 'PNG', 10, currentY, chartsImgWidth, chartsImgHeight);
            }

            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(156, 163, 175);
                pdf.text(
                    `Página ${i} de ${totalPages} | Generado el ${new Date().toLocaleDateString('es-CO')}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }

            const nombreArchivo = `Reporte_${(eventoSeleccionado.titulo || eventoSeleccionado.nombre || 'Evento').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(nombreArchivo);

        } catch {
            toast.error('Hubo un error al generar el PDF. Por favor intenta nuevamente.');
        } finally {
            setGeneratingPDF(false);
        }
    };

    const eventoSeleccionado = eventos.find(e =>
        String(e.id || e._id || e.codigo) === String(selectedEventoId)
    );

    if (loading) {
        return (
            <div className="layout-container">
                <Sidebar />
                <div className="main-content">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Cargando estadísticas...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-content">

                <div className="page-header-stats">
                    <h1 className="page-title-stats">Reportes y Estadísticas</h1>
                    <p className="page-subtitle-stats">Visualiza métricas y análisis de asistencia</p>
                </div>

                <div className="evento-selector-stats">
                    <label className="evento-label">Seleccionar evento para análisis:</label>
                    <select
                        className="evento-select-stats"
                        value={selectedEventoId || ''}
                        onChange={(e) => setSelectedEventoId(e.target.value)}
                    >
                        <option value="">-- Seleccione un evento --</option>
                        {eventos.map(ev => (
                            <option
                                key={ev.id || ev._id || ev.codigo}
                                value={String(ev.id || ev._id || ev.codigo)}
                            >
                                {ev.titulo || ev.nombre || `Evento ${ev.id || ev._id}`}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="error-banner">
                        <XCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {selectedEventoId && eventoSeleccionado && (
                    <div className="evento-header">
                        <div className="evento-header-content">
                            <h2 className="evento-titulo">
                                {eventoSeleccionado.titulo || eventoSeleccionado.nombre}
                            </h2>

                            <div className="evento-meta">
                                <span className="evento-fecha">
                                    {eventoSeleccionado.fecha_inicio || 'Fecha no disponible'}
                                </span>

                                {eventoSeleccionado.modalidad && (
                                    <span className="evento-modalidad badge badge-presencial">
                                        {eventoSeleccionado.modalidad}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                                className="btn-export-report"
                                onClick={handleExportarCSVReporte}
                                disabled={exportingCSV || estadisticas.totalInscritos === 0}
                                style={{ backgroundColor: '#0f766e', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                {exportingCSV ? 'Exportando...' : 'Exportar CSV'}
                            </button>
                            <button 
                                className="btn-export-report" 
                                onClick={generarPDF}
                                disabled={generatingPDF || estadisticas.totalInscritos === 0}
                            >
                                {generatingPDF ? 'Generando PDF...' : 'Exportar Reporte PDF'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="stats-cards-grid" ref={statsRef}>
                    <div className="stat-card-large stat-blue">
                        <div className="stat-icon"><Users size={24} /></div>
                        <div className="stat-content">
                            <p className="stat-label-large">TOTAL INSCRITOS</p>
                            <p className="stat-value-large">{estadisticas.totalInscritos}</p>
                        </div>
                    </div>

                    <div className="stat-card-large stat-green">
                        <div className="stat-icon"><UserCheck size={24} /></div>
                        <div className="stat-content">
                            <p className="stat-label-large">ASISTENTES CONFIRMADOS</p>
                            <p className="stat-value-large">{estadisticas.confirmados}</p>
                        </div>
                    </div>

                    <div className="stat-card-large stat-red">
                        <div className="stat-icon"><UserX size={24} /></div>
                        <div className="stat-content">
                            <p className="stat-label-large">CANCELACIONES</p>
                            <p className="stat-value-large">{estadisticas.cancelaciones}</p>
                        </div>
                    </div>

                    <div className="stat-card-large stat-purple">
                        <div className="stat-icon"><TrendingUp size={24} /></div>
                        <div className="stat-content">
                            <p className="stat-label-large">% ASISTENCIA</p>
                            <p className="stat-value-large">{estadisticas.porcentajeAsistencia}%</p>
                        </div>
                    </div>
                </div>

                <div className="charts-grid" ref={chartsRef}>
                    <div className="chart-card">
                        <h3 className="chart-title">Asistencia por Actividad</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={estadisticas.asistenciaPorActividad}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="asistentes" fill="#10b981" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="inscritos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">Distribución General</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={estadisticas.distribucion}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                    outerRadius={100}
                                    dataKey="value"
                                >
                                    {estadisticas.distribucion.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {estadisticas.totalInscritos === 0 && !loading && (
                    <div className="empty-state-stats">
                        <TrendingUp size={64} color="#9ca3af" />
                        <h3>No hay datos disponibles</h3>
                        <p>Selecciona un evento con inscripciones para ver las estadísticas</p>
                    </div>
                )}
            </div>
        </div>
    );
}
