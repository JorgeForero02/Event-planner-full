import { useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import encuestaService from '../../../services/encuestaService';

export const useEncuestas = () => {
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [completando, setCompletando] = useState(false);

    const { user } = useAuth();

    const getUserId = useCallback(() => {
        if (user) {
            if (user.rolData && user.rolData.id_asistente) {
                return user.rolData.id_asistente;
            }

            const posiblesIds = {
                'id_asistente': user.id_asistente,
                'asistente_id': user.asistente_id,
                'idAsistente': user.idAsistente,
                'id': user.id,
            };

            for (const [, value] of Object.entries(posiblesIds)) {
                if (value !== undefined && value !== null) {
                    return value;
                }
            }
        }

        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));

                if (payload.rolData && payload.rolData.id_asistente) {
                    return payload.rolData.id_asistente;
                }

                return payload.id;
            }
        } catch (error) {
        }

        return null;
    }, [user]);

    const obtenerEncuestas = useCallback(async (opciones = {}) => {
        const { actividadId, eventoId, tipoEncuesta } = opciones;

        setLoading(true);
        setError(null);

        try {
            let endpoint = '';

            if (eventoId) {
                endpoint = `/encuestas?evento_id=${eventoId}`;
            } else {
                throw new Error('Se requiere eventoId');
            }

            const response = await encuestaService.fetch(endpoint);

            if (response.success) {
                let todasLasEncuestas = response.data || [];

                let encuestasFiltradas = todasLasEncuestas.filter(encuesta => {
                    if (tipoEncuesta === 'satisfaccion_evento') {
                        return encuesta.tipo_encuesta === 'satisfaccion_evento' &&
                            encuesta.id_evento === eventoId &&
                            encuesta.id_actividad === null;
                    }

                    if (tipoEncuesta && tipoEncuesta !== 'satisfaccion_evento') {
                        if (actividadId) {
                            return encuesta.tipo_encuesta === tipoEncuesta &&
                                encuesta.id_actividad === actividadId;
                        } else {
                            return encuesta.tipo_encuesta === tipoEncuesta;
                        }
                    }

                    if (actividadId) {
                        return encuesta.id_actividad === actividadId;
                    }

                    return true;
                });

                const encuestasConEstadoVerificado = encuestasFiltradas.map(encuesta => {
                    const userId = getUserId();
                    if (!userId) return encuesta;

                    const estadoGuardado = localStorage.getItem(`encuesta_${encuesta.id}_estado_${userId}`);

                    if (estadoGuardado === 'completada') {

                        const respuestasExistentes = encuesta.respuestas || [];
                        const respuestaExistenteIndex = respuestasExistentes.findIndex(
                            r => r.id_asistente === userId
                        );

                        if (respuestaExistenteIndex >= 0) {
                            const nuevasRespuestas = [...respuestasExistentes];
                            nuevasRespuestas[respuestaExistenteIndex] = {
                                ...nuevasRespuestas[respuestaExistenteIndex],
                                estado: 'completada'
                            };
                            return {
                                ...encuesta,
                                respuestas: nuevasRespuestas
                            };
                        } else {
                            return {
                                ...encuesta,
                                respuestas: [
                                    ...respuestasExistentes,
                                    {
                                        estado: 'completada',
                                        fecha_completado: new Date().toISOString(),
                                        id_encuesta: encuesta.id,
                                        id_asistente: userId
                                    }
                                ]
                            };
                        }
                    }

                    return encuesta;
                });

                setEncuestas(encuestasConEstadoVerificado);
                return encuestasConEstadoVerificado;
            } else {
                throw new Error(response.message || 'Error al obtener encuestas');
            }
        } catch (error) {
            setError(error.message || 'Error al cargar encuestas');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [getUserId]);

    const obtenerEncuestasPorActividad = useCallback(async (actividadId, tipoEncuesta = null) => {
        throw new Error('Este método requiere eventoId. Usa obtenerEncuestas({ actividadId, eventoId, tipoEncuesta })');
    }, []);

    const marcarComoCompletada = async (idEncuesta) => {
        try {
            const userId = getUserId();

            if (!userId) {
                throw new Error('No se pudo obtener el ID del asistente');
            }

            setCompletando(true);

            try {
                const response = await encuestaService.completarEncuesta(idEncuesta, userId);

                if (!response.success) {
                    throw new Error(response.message || 'Error al completar encuesta');
                }

            } catch (error) {

                if (error.status === 409 || error.message.includes('ya ha sido completada')) {
                } else {
                    throw error;
                }
            }

            setEncuestas(prevEncuestas =>
                prevEncuestas.map(encuesta => {
                    if (encuesta.id === idEncuesta) {

                        const respuestasExistentes = encuesta.respuestas || [];
                        const respuestaExistenteIndex = respuestasExistentes.findIndex(
                            r => r.id_asistente === userId
                        );

                        const nuevaRespuesta = {
                            estado: 'completada',
                            fecha_completado: new Date().toISOString(),
                            id_encuesta: idEncuesta,
                            id_asistente: userId
                        };

                        let nuevasRespuestas;
                        if (respuestaExistenteIndex >= 0) {
                            nuevasRespuestas = [...respuestasExistentes];
                            nuevasRespuestas[respuestaExistenteIndex] = {
                                ...nuevasRespuestas[respuestaExistenteIndex],
                                ...nuevaRespuesta
                            };
                        } else {
                            nuevasRespuestas = [...respuestasExistentes, nuevaRespuesta];
                        }

                        return {
                            ...encuesta,
                            respuestas: nuevasRespuestas
                        };
                    }
                    return encuesta;
                })
            );

            localStorage.setItem(`encuesta_${idEncuesta}_estado_${userId}`, 'completada');

            return {
                success: true,
                message: 'Estado de encuesta actualizado'
            };

        } catch (error) {
            throw error;
        } finally {
            setCompletando(false);
        }
    };
    const filtrarPorTipo = useCallback((tipo) => {
        if (!tipo) return encuestas;
        return encuestas.filter(encuesta => encuesta.tipo_encuesta === tipo);
    }, [encuestas]);

    const obtenerEstadoEncuesta = useCallback((encuesta) => {
        console.log({
            id: encuesta.id,
            tieneRespuestas: !!encuesta.respuestas,
            respuestas: encuesta.respuestas
        });

        const userId = getUserId();
        if (!userId) {
            return { estado: 'no_enviada', texto: 'No enviada' };
        }

        const estadoGuardado = localStorage.getItem(`encuesta_${encuesta.id}_estado_${userId}`);

        if (estadoGuardado) {
            return {
                estado: estadoGuardado,
                texto: estadoGuardado === 'completada' ? 'Completada' : 'Pendiente'
            };
        }

        if (!encuesta.respuestas || encuesta.respuestas.length === 0) {
            return { estado: 'no_enviada', texto: 'No enviada' };
        }

        const respuestaAsistente = encuesta.respuestas.find(
            respuesta => respuesta.id_asistente === userId
        );

        console.log({
            userId,
            respuesta: respuestaAsistente
        });

        if (!respuestaAsistente) {
            return { estado: 'no_enviada', texto: 'No enviada' };
        }

        if (respuestaAsistente.estado === 'completada') {
            localStorage.setItem(`encuesta_${encuesta.id}_estado_${userId}`, 'completada');
            return { estado: 'completada', texto: 'Completada' };
        } else if (respuestaAsistente.estado === 'pendiente') {
            return { estado: 'pendiente', texto: 'Pendiente' };
        }

        if (respuestaAsistente.fecha_completado) {
            localStorage.setItem(`encuesta_${encuesta.id}_estado_${userId}`, 'completada');
            return { estado: 'completada', texto: 'Completada' };
        }

        return { estado: 'pendiente', texto: 'Pendiente' };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        encuestas,
        loading,
        error,
        completando,
        obtenerEncuestas,
        obtenerEncuestasPorActividad,
        marcarComoCompletada,
        filtrarPorTipo,
        obtenerEstadoEncuesta,
        setEncuestas
    };
};