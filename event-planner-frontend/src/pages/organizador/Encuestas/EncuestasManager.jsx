import React from 'react';
import './EncuestasManager.css';
import ListaEncuestas from './ListaEncuestas';
import FormularioEncuesta from './FormularioEncuesta';
import EnviarEncuestaAsistentes from './EnviarEncuestaAsistentes';
import Sidebar from "../Sidebar";
import EstadisticasEncuesta from './EstadisticasEncuesta';
import { useEncuestasManager } from '../../../components/useEncuestasManager';

const EncuestasManager = () => {
    const {
        encuestas,
        eventos,
        actividades,
        eventoSeleccionado,
        mostrarFormulario,
        modoEdicion,
        encuestaSeleccionada,
        mostrarResultados,
        mostrarEnvioEncuesta,
        mostrarEstadisticas,
        errores,
        mensaje,
        cargando,
        formData,
        seleccionarEvento,
        volverAEventos,
        handleInputChange,
        handleSubmit,
        abrirEstadisticas,
        cerrarEstadisticas,
        abrirFormularioNuevo,
        editarEncuesta,
        cerrarFormulario,
        eliminarEncuesta,
        activarEncuesta,
        habilitarParaPonente,
        abrirEnvioEncuesta,
        cerrarEnvioEncuesta,
        handleEnvioExitoso,
        verResultados,
        setMostrarResultados
    } = useEncuestasManager();

    return (
        <div className="encuestas-manager">
            <Sidebar />
            <div className="encuestas-header">
                <div className="header-left">
                    <div className="icon-title">
                        <h2>Gestionar Encuestas</h2>
                    </div>
                </div>
                {eventoSeleccionado && !mostrarFormulario && !mostrarResultados && !mostrarEstadisticas && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-volver" onClick={volverAEventos}>
                            ← Volver a Eventos
                        </button>
                        <button className="btn-nueva-encuesta" onClick={abrirFormularioNuevo} disabled={cargando}>
                            + Nueva Encuesta
                        </button>
                    </div>
                )}
            </div>

            {mensaje.texto && (
                <div className={`mensaje mensaje-${mensaje.tipo}`}>
                    {mensaje.texto}
                </div>
            )}

            {cargando && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Cargando...</p>
                </div>
            )}

            {!eventoSeleccionado && !mostrarFormulario && !mostrarResultados && (
                <div className="eventos-catalogo">
                    <h3>Selecciona un Evento</h3>
                    {eventos.length === 0 ? (
                        <div className="empty-state">
                                <h3>No hay eventos disponibles</h3>
                            <p>Crea un evento primero para poder gestionar sus encuestas</p>
                        </div>
                    ) : (
                        <div className="eventos-grid">
                            {eventos.map(evento => (
                                <div key={evento.id} className="evento-card" onClick={() => seleccionarEvento(evento)}>
                                    <div className="evento-info">
                                        <h4>{evento.titulo}</h4>
                                        <div className="evento-meta">
                                            <span>{evento.fecha_inicio} - {evento.fecha_fin}</span>
                                            <span>{evento.modalidad || 'Sin modalidad'}</span>
                                        </div>
                                    </div>
                                    <div className="evento-accion">
                                        <button className="btn-seleccionar">Ver Encuestas →</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {eventoSeleccionado && !mostrarFormulario && !mostrarResultados && (
                <ListaEncuestas
                    encuestas={encuestas}
                    actividades={actividades}
                    onVerResultados={verResultados}
                    onVerEstadisticas={abrirEstadisticas}
                    onEditar={editarEncuesta}
                    onActivar={activarEncuesta}
                    onEliminar={eliminarEncuesta}
                    onEnviar={abrirEnvioEncuesta}
                    onHabilitar={habilitarParaPonente}
                    onCrearPrimera={abrirFormularioNuevo}
                />
            )}

            {mostrarFormulario && (
                <FormularioEncuesta
                    formData={formData}
                    modoEdicion={modoEdicion}
                    errores={errores}
                    cargando={cargando}
                    eventoSeleccionado={eventoSeleccionado}
                    actividades={actividades}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onCerrar={cerrarFormulario}
                />
            )}

            {mostrarEnvioEncuesta && encuestaSeleccionada && eventoSeleccionado && (
                <EnviarEncuestaAsistentes
                    encuesta={encuestaSeleccionada}
                    eventoId={eventoSeleccionado.id}
                    onCerrar={cerrarEnvioEncuesta}
                    onEnvioExitoso={handleEnvioExitoso}
                />
            )}

            {mostrarResultados && encuestaSeleccionada && (
                <div className="resultados-panel">
                    <div className="resultados-header">
                        <h3>Estadísticas: {encuestaSeleccionada.titulo}</h3>
                        <button className="btn-cerrar" onClick={() => setMostrarResultados(false)}>✕</button>
                    </div>

                    <div className="resultados-content">
                        <div className="estadisticas-grid">
                            <div className="stat-card">
                                <span className="stat-value">{encuestaSeleccionada.respuestas_count || 0}</span>
                                <span className="stat-label">Total Respuestas</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">{encuestaSeleccionada.tasa_respuesta || '0%'}</span>
                                <span className="stat-label">Tasa de Respuesta</span>
                            </div>
                        </div>

                        <div className="resultados-acciones">
                            <a
                                href={encuestaSeleccionada.url_respuestas || encuestaSeleccionada.url_google_form}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-ver-google"
                            >
                                Ver en Google Forms
                            </a>
                        </div>

                        <div className="info-message">
                            <span>ℹ️</span>
                            <p>
                                Los resultados detallados se gestionan directamente en Google Forms.
                                Haz clic en "Ver en Google Forms" para acceder al análisis completo.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {mostrarEstadisticas && encuestaSeleccionada && (
                <EstadisticasEncuesta
                    encuestaId={encuestaSeleccionada.id}
                    onCerrar={cerrarEstadisticas}
                />
            )}
        </div>
    );
};

export default EncuestasManager;