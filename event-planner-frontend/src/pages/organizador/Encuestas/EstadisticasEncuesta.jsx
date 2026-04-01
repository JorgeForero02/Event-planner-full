import React, { useState, useEffect } from 'react';
import './EstadisticasEncuesta.css';
import StatusBadge from '../../../components/ui/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import DataTable from '../../../components/ui/DataTable';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;
pdfMake.fonts = {
    Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
    }
};
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const EstadisticasEncuesta = ({ encuestaId, onCerrar }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exportando, setExportando] = useState(false);
    const [mostrarMenuExportar, setMostrarMenuExportar] = useState(false);

    const getAuthToken = () => {
        return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    };

    const getHeaders = () => ({
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
    });

    useEffect(() => {
        cargarEstadisticas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [encuestaId]);
    const cargarEstadisticas = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/encuestas/${encuestaId}/estadisticas`, {
                method: 'GET',
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error al obtener estadísticas: ${response.status}`);
            }

            const result = await response.json();
            setData(result.data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };


    // ==================== FUNCIONES DE EXPORTACIÓN ====================

    const exportarCSV = () => {
        try {
            setExportando(true);
            const { encuesta, estadisticas, respuestas } = data;

            // Encabezados
            const headers = ['ID', 'Asistente', 'Correo', 'Estado', 'Fecha Envío', 'Fecha Completado'];

            // Construir el CSV
            let csvContent = '\uFEFF'; // BOM para UTF-8

            // Información de la encuesta
            csvContent += `Encuesta: ${encuesta.titulo}\n`;
            csvContent += `Tipo: ${encuesta.tipo_encuesta.replace('_', ' ')}\n`;
            csvContent += `Momento: ${encuesta.momento}\n`;
            csvContent += `Estado: ${encuesta.estado}\n`;
            csvContent += `Total Enviadas: ${estadisticas.total_enviadas}\n`;
            csvContent += `Total Completadas: ${estadisticas.total_completadas}\n`;
            csvContent += `Total Pendientes: ${estadisticas.total_pendientes}\n`;
            csvContent += `Tasa de Respuesta: ${estadisticas.tasa_respuesta}\n`;
            csvContent += '\n';

            // Encabezados de la tabla
            csvContent += headers.join(',') + '\n';

            // Datos de respuestas
            respuestas.forEach(respuesta => {
                const row = [
                    respuesta.id,
                    `"${respuesta.asistente.nombre}"`,
                    respuesta.asistente.correo,
                    respuesta.estado,
                    formatearFecha(respuesta.fecha_envio),
                    formatearFecha(respuesta.fecha_completado)
                ];
                csvContent += row.join(',') + '\n';
            });

            // Crear y descargar el archivo
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `estadisticas_${encuesta.titulo.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setMostrarMenuExportar(false);
            alert('✅ CSV exportado correctamente');
        } catch (err) {
            alert('❌ Error al exportar CSV: ' + err.message);
        } finally {
            setExportando(false);
        }
    };

    const exportarExcel = async () => {
        try {
            setExportando(true);
            const { encuesta, estadisticas, respuestas } = data;

            // Importación dinámica de xlsx
            const XLSX = await import('xlsx');

            // Crear libro de trabajo
            const wb = XLSX.utils.book_new();

            // Hoja 1: Información de la encuesta
            const infoData = [
                ['Información de la Encuesta'],
                [''],
                ['Título', encuesta.titulo],
                ['Tipo', encuesta.tipo_encuesta.replace('_', ' ')],
                ['Momento', encuesta.momento],
                ['Estado', encuesta.estado],
                ['Obligatoria', encuesta.obligatoria ? 'Sí' : 'No'],
                ['Fecha Inicio', formatearFecha(encuesta.fecha_inicio)],
                ['Fecha Fin', formatearFecha(encuesta.fecha_fin)],
                [''],
                ['Estadísticas Generales'],
                [''],
                ['Total Enviadas', estadisticas.total_enviadas],
                ['Total Completadas', estadisticas.total_completadas],
                ['Total Pendientes', estadisticas.total_pendientes],
                ['Tasa de Respuesta', estadisticas.tasa_respuesta]
            ];

            if (encuesta.descripcion) {
                infoData.push(['Descripción', encuesta.descripcion]);
            }

            const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
            XLSX.utils.book_append_sheet(wb, wsInfo, 'Información');

            // Hoja 2: Respuestas detalladas
            const respuestasData = [
                ['ID', 'Asistente', 'Correo', 'Estado', 'Fecha Envío', 'Fecha Completado']
            ];

            respuestas.forEach(respuesta => {
                respuestasData.push([
                    respuesta.id,
                    respuesta.asistente.nombre,
                    respuesta.asistente.correo,
                    respuesta.estado,
                    formatearFecha(respuesta.fecha_envio),
                    formatearFecha(respuesta.fecha_completado)
                ]);
            });

            const wsRespuestas = XLSX.utils.aoa_to_sheet(respuestasData);
            XLSX.utils.book_append_sheet(wb, wsRespuestas, 'Respuestas');

            // Descargar el archivo
            XLSX.writeFile(wb, `estadisticas_${encuesta.titulo.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.xlsx`);

            setMostrarMenuExportar(false);
            alert('✅ Excel exportado correctamente');
        } catch (err) {
            alert('❌ Error al exportar Excel: ' + err.message);
        } finally {
            setExportando(false);
        }
    };
    const exportarPDF = async () => {
        try {
            setExportando(true);
            const { encuesta, estadisticas, respuestas } = data;

            // Importar jsPDF dinámicamente (sin autotable)
            const { jsPDF } = await import('jspdf');

            const doc = new jsPDF();
            let y = 10;

            // Título
            doc.setFontSize(16);
            doc.text(`Estadísticas: ${encuesta.titulo}`, 10, y);
            y += 10;

            // Información básica
            doc.setFontSize(10);
            doc.text(`Tipo: ${encuesta.tipo_encuesta.replace('_', ' ')}`, 10, y);
            y += 7;
            doc.text(`Estado: ${encuesta.estado}`, 10, y);
            y += 7;
            doc.text(`Total Enviadas: ${estadisticas.total_enviadas}`, 10, y);
            y += 7;
            doc.text(`Completadas: ${estadisticas.total_completadas}`, 10, y);
            y += 7;
            doc.text(`Pendientes: ${estadisticas.total_pendientes}`, 10, y);
            y += 10;

            // Tabla manual (sin autotable)
            doc.setFontSize(12);
            doc.text('Respuestas:', 10, y);
            y += 10;

            // Encabezados
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text('Asistente', 10, y);
            doc.text('Correo', 60, y);
            doc.text('Estado', 120, y);
            doc.text('Fecha', 150, y);
            y += 7;

            // Línea
            doc.line(10, y, 200, y);
            y += 5;

            // Datos
            doc.setFont(undefined, 'normal');
            respuestas.forEach((r, i) => {
                if (y > 270) { // Nueva página si se llena
                    doc.addPage();
                    y = 20;
                }

                doc.text(r.asistente.nombre.substring(0, 20), 10, y);
                doc.text(r.asistente.correo.substring(0, 25), 60, y);
                doc.text(r.estado, 120, y);
                doc.text(formatearFecha(r.fecha_completado) || 'Pendiente', 150, y);
                y += 7;
            });

            // Guardar
            doc.save(`estadisticas_${encuesta.titulo.replace(/[^a-z0-9]/gi, '_')}.pdf`);

            setMostrarMenuExportar(false);
            alert('✅ PDF descargado');

        } catch (err) {
            alert('❌ Error: ' + err.message);
        } finally {
            setExportando(false);
        }
    };

    // ==================== FIN FUNCIONES DE EXPORTACIÓN ====================

    if (loading) {
        return (
            <Dialog open={true} onOpenChange={(open) => !open && onCerrar()}>
                <DialogContent>
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Cargando estadísticas...</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (error) {
        return (
            <Dialog open={true} onOpenChange={(open) => !open && onCerrar()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>⚠️ Error</DialogTitle>
                    </DialogHeader>
                    <div className="error-message">
                        <p>{error}</p>
                        <DialogFooter>
                            <button onClick={onCerrar} className="btn-volver-estadisticas">
                                Volver
                            </button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const { encuesta, estadisticas, respuestas } = data;

    return (
        <Dialog open={true} onOpenChange={(open) => !open && !exportando && onCerrar()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>📊 Estadísticas Detalladas</DialogTitle>
                </DialogHeader>
                <div className="modal-content">
                    <div className="exportar-dropdown">
                        <button
                            className="btn-exportar-principal"
                            onClick={() => setMostrarMenuExportar(!mostrarMenuExportar)}
                            disabled={exportando}
                        >
                            {exportando ? '⏳ Exportando...' : '📥 Exportar'}
                        </button>

                        {mostrarMenuExportar && (
                            <div className="menu-exportar">
                                <button
                                    className="opcion-exportar"
                                    onClick={exportarCSV}
                                    disabled={exportando}
                                >
                                    📄 Exportar a CSV
                                </button>
                                <button
                                    className="opcion-exportar"
                                    onClick={exportarExcel}
                                    disabled={exportando}
                                >
                                    📊 Exportar a Excel
                                </button>
                                <button
                                    className="opcion-exportar"
                                    onClick={exportarPDF}
                                    disabled={exportando}
                                >
                                    📑 Exportar a PDF
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Información de la encuesta */}
                    <div className="card-estadisticas info-encuesta">
                        <h3>{encuesta.titulo}</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <strong>Tipo:</strong>
                                <span>{encuesta.tipo_encuesta.replace('_', ' ')}</span>
                            </div>
                            <div className="info-item">
                                <strong>Momento:</strong>
                                <span>{encuesta.momento}</span>
                            </div>
                            <div className="info-item">
                                <strong>Estado:</strong>
                                <StatusBadge status={encuesta.estado} />
                            </div>
                            <div className="info-item">
                                <strong>Obligatoria:</strong>
                                <span>{encuesta.obligatoria ? 'Sí' : 'No'}</span>
                            </div>
                            <div className="info-item">
                                <strong>Fecha inicio:</strong>
                                <span>{formatearFecha(encuesta.fecha_inicio)}</span>
                            </div>
                            <div className="info-item">
                                <strong>Fecha fin:</strong>
                                <span>{formatearFecha(encuesta.fecha_fin)}</span>
                            </div>
                        </div>
                        {encuesta.descripcion && (
                            <div className="descripcion">
                                <strong>Descripción:</strong>
                                <p>{encuesta.descripcion}</p>
                            </div>
                        )}
                        {encuesta.evento && (
                            <div className="evento-info-estadisticas">
                                <strong>Evento:</strong> {encuesta.evento.titulo}
                            </div>
                        )}
                    </div>

                    {/* Estadísticas generales */}
                    <div className="estadisticas-grid-modal">
                        <div className="stat-card-modal">
                            <div className="stat-icon-modal">📊</div>
                            <div className="stat-content-modal">
                                <h3>{estadisticas.total_enviadas}</h3>
                                <p>Total Enviadas</p>
                            </div>
                        </div>
                        <div className="stat-card-modal completadas">
                            <div className="stat-icon-modal">✅</div>
                            <div className="stat-content-modal">
                                <h3>{estadisticas.total_completadas}</h3>
                                <p>Completadas</p>
                            </div>
                        </div>
                        <div className="stat-card-modal pendientes">
                            <div className="stat-icon-modal">⏳</div>
                            <div className="stat-content-modal">
                                <h3>{estadisticas.total_pendientes}</h3>
                                <p>Pendientes</p>
                            </div>
                        </div>
                        <div className="stat-card-modal tasa">
                            <div className="stat-icon-modal">📈</div>
                            <div className="stat-content-modal">
                                <h3>{estadisticas.tasa_respuesta}</h3>
                                <p>Tasa de Respuesta</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de respuestas */}
                    <div className="card-estadisticas tabla-respuestas">
                        <h3>Detalle de Respuestas ({respuestas.length})</h3>
                        <DataTable
                            columns={[
                                { key: 'id', label: 'ID' },
                                { key: 'asistente', label: 'Asistente', render: (val) => val?.nombre },
                                { key: 'asistente_correo', label: 'Correo', render: (_, row) => row.asistente?.correo },
                                { key: 'estado', label: 'Estado', render: (val) => <StatusBadge status={val} /> },
                                { key: 'fecha_envio', label: 'Fecha Envío', render: (val) => formatearFecha(val) },
                                { key: 'fecha_completado', label: 'Fecha Completado', render: (val) => formatearFecha(val) },
                            ]}
                            data={respuestas}
                            emptyState={{
                                title: 'Sin respuestas',
                                description: 'No hay respuestas registradas para esta encuesta.',
                            }}
                        />
                    </div>

                    {/* Enlaces a Google Forms */}
                    <div className="card-estadisticas enlaces-forms">
                        <h3>Enlaces</h3>
                        <div className="enlaces-grid-estadisticas">
                            <a
                                href={encuesta.url_google_form}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-link-estadisticas"
                            >
                                📝 Ver Formulario
                            </a>
                            <a
                                href={encuesta.url_respuestas || encuesta.url_google_form}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-link-estadisticas"
                            >
                                📊 Ver Respuestas en Google
                            </a>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EstadisticasEncuesta;