import React, { useState } from 'react';

const ListaEncuestas = ({
    encuestas,
    actividades,
    onVerResultados,
    onVerEstadisticas,
    onEditar,
    onActivar,
    onEliminar,
    onEnviar,
    onHabilitar,
    onCrearPrimera
}) => {
    const [modalHabilitar, setModalHabilitar] = useState(null);
    const [actividadSeleccionada, setActividadSeleccionada] = useState('');
    if (encuestas.length === 0) {
        return (
            <div className="empty-state">
                <h3>No hay encuestas para este evento</h3>
                <p>Crea la primera encuesta para obtener feedback de los asistentes</p>
                <button className="btn-crear-primera" onClick={onCrearPrimera}>
                    Crear Primera Encuesta
                </button>
            </div>
        );
    }

    const confirmarHabilitar = () => {
        if (!modalHabilitar || !actividadSeleccionada) return;
        onHabilitar(modalHabilitar.id, Number(actividadSeleccionada));
        setModalHabilitar(null);
        setActividadSeleccionada('');
    };

    return (
        <>
        <div className="encuestas-lista">
            {encuestas.map(encuesta => (
                <div key={encuesta.id} className="encuesta-card">
                    <div className="encuesta-header-card">
                        <div className="encuesta-info">
                            <h3>{encuesta.titulo}</h3>
                            <div className="encuesta-meta">
                                <span className={`badge badge-${encuesta.estado}`}>
                                    {encuesta.estado === 'activa' ? 'Activa' :
                                        encuesta.estado === 'borrador' ? 'Borrador' : 'Cerrada'}
                                </span>
                                <span className="tipo-badge">
                                    {encuesta.tipo_encuesta === 'pre_actividad' ? 'Pre-Actividad' :
                                        encuesta.tipo_encuesta === 'durante_actividad' ? 'Durante la Actividad' :
                                            encuesta.tipo_encuesta === 'post_actividad' ? 'Post-Actividad' :
                                                encuesta.tipo_encuesta === 'satisfaccion_evento' ? 'Satisfacción de Evento' :
                                                    'General'}
                                </span>
                            </div>
                            <div className="encuesta-detalles">
                                {encuesta.actividad_nombre && (
                                    <span>Actividad: {encuesta.actividad_nombre}</span>
                                )}
                                <span>
                                    Tipo: {encuesta.momento === 'antes' ? 'Antes' :
                                        encuesta.momento === 'durante' ? 'Durante' : 'Después'} del evento
                                </span>
                                <span>
                                    Fecha inicio: {encuesta.fecha_inicio}
                                </span>
                                <span>
                                    Fecha fin: {encuesta.fecha_fin}
                                </span>
                                {encuesta.descripcion && (
                                    <span>
                                        Descripción: {encuesta.descripcion}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="encuesta-acciones">
                            <div className="estadisticas-mini">  
                                <span className="stat-number">
                                    {encuesta.total_completadas || 
                                     (encuesta.respuestas?.filter(r => r.estado === 'completada').length) || 
                                     0}
                                </span>
                                <span className="stat-label">respuestas</span>
                            </div>

                            {/* Primera fila: 3 botones */}
                            <button
                                className="btn-accion btn-estadisticas"
                                onClick={() => onVerEstadisticas(encuesta)}
                                title="Ver Estadísticas Detalladas"
                            >
                                Estadísticas
                            </button>

                            <button
                                className="btn-accion btn-enviarr"
                                onClick={() => onEnviar(encuesta)}
                                title="Enviar a Asistentes"
                                disabled={encuesta.estado === 'cerrada'}
                            >
                                Enviar
                            </button>

                            <button
                                className="btn-accion"
                                style={{ backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                onClick={() => { setModalHabilitar(encuesta); setActividadSeleccionada(''); }}
                                title="Habilitar para Ponente"
                            >
                                Para Ponente
                            </button>

                            {/* Segunda fila: 2 botones */}
                            <button
                                className="btn-accion btn-ver"
                                onClick={() => onVerResultados(encuesta)}
                                title="Ver Resumen Rápido"
                            >
                                Ver
                            </button>

                            <button
                                className="btn-accion btn-editar"
                                onClick={() => onEditar(encuesta)}
                                title="Editar"
                            >
                                Editar
                            </button>

                            <button
                                className="btn-accion btn-eliminar"
                                onClick={() => onEliminar(encuesta.id)}
                                title="Eliminar"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Modal: Habilitar para ponente */}
            {modalHabilitar && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Habilitar encuesta para ponente</h3>
                        <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#64748b' }}>
                            Selecciona la actividad cuyo ponente podrá responder la encuesta <strong>{modalHabilitar.titulo}</strong>.
                        </p>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Actividad *</label>
                        <select
                            value={actividadSeleccionada}
                            onChange={(e) => setActividadSeleccionada(e.target.value)}
                            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', marginBottom: '1.25rem', boxSizing: 'border-box' }}
                        >
                            <option value="">-- Selecciona una actividad --</option>
                            {(actividades || []).map(a => (
                                <option key={a.id_actividad || a.id} value={a.id_actividad || a.id}>
                                    {a.titulo}
                                </option>
                            ))}
                        </select>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setModalHabilitar(null)}
                                style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem', color: '#374151', fontWeight: 600 }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarHabilitar}
                                disabled={!actividadSeleccionada}
                                style={{ backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1.25rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, opacity: actividadSeleccionada ? 1 : 0.5 }}
                            >
                                Habilitar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ListaEncuestas;
