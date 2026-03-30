import { BaseService } from './api/baseService';

class EncuestaService extends BaseService {
    constructor() {
        super();
        this.endpoint = '/encuestas';
    }

    // Obtener encuestas por actividad
    async obtenerPorActividad(actividadId) {
        try {
            const response = await this.fetch(`${this.endpoint}?actividad_id=${actividadId}`);
            return response;
        } catch (error) {
            console.error('Error al obtener encuestas por actividad:', error);
            throw error;
        }
    }

    // Obtener encuestas por evento
    async obtenerPorEvento(eventoId) {
        try {
            const response = await this.fetch(`${this.endpoint}?evento_id=${eventoId}`);
            return response;
        } catch (error) {
            console.error('Error al obtener encuestas por evento:', error);
            throw error;
        }
    }

    // Crear nueva encuesta
    async crearEncuesta(encuestaData) {
        try {
            console.log('🔍 encuestaService.crearEncuesta - Iniciando');
            console.log('🔍 Datos de encuesta:', encuestaData);

            // Validar que tenga al menos evento o actividad
            if (!encuestaData.id_evento && !encuestaData.id_actividad) {
                throw new Error('Debe asociar la encuesta a un evento o actividad');
            }

            const response = await this.fetch(this.endpoint, {
                method: 'POST',
                body: JSON.stringify({
                    ...encuestaData,
                    estado: 'borrador' // Estado por defecto
                })
            });

            console.log('✅ encuestaService.crearEncuesta - Éxito:', response);
            return response;
        } catch (error) {
            console.error('❌ encuestaService.crearEncuesta - Error:', error);
            throw error;
        }
    }

    // Obtener encuesta por ID
    async obtenerPorId(encuestaId) {
        try {
            const response = await this.fetch(`${this.endpoint}/${encuestaId}`);
            return response;
        } catch (error) {
            console.error('Error al obtener encuesta por ID:', error);
            throw error;
        }
    }

    // Actualizar encuesta
    async actualizarEncuesta(encuestaId, datosActualizacion) {
        try {
            console.log('🔍 encuestaService.actualizarEncuesta - Iniciando');
            console.log('🔍 Datos de actualización:', datosActualizacion);

            const response = await this.fetch(`${this.endpoint}/${encuestaId}`, {
                method: 'PUT',
                body: JSON.stringify(datosActualizacion)
            });

            console.log('✅ encuestaService.actualizarEncuesta - Éxito:', response);
            return response;
        } catch (error) {
            console.error('❌ encuestaService.actualizarEncuesta - Error:', error);
            throw error;
        }
    }

    // Eliminar encuesta
    async eliminarEncuesta(encuestaId) {
        try {
            const response = await this.fetch(`${this.endpoint}/${encuestaId}`, {
                method: 'DELETE'
            });
            return response;
        } catch (error) {
            console.error('Error al eliminar encuesta:', error);
            throw error;
        }
    }

    // Enviar encuesta masivamente
    async enviarEncuestaMasiva(encuestaId) {
        try {
            console.log('🔍 encuestaService.enviarEncuestaMasiva - Iniciando');

            const response = await this.fetch(`${this.endpoint}/${encuestaId}/enviar`, {
                method: 'POST'
            });

            console.log('✅ encuestaService.enviarEncuestaMasiva - Éxito:', response);
            return response;
        } catch (error) {
            console.error('❌ encuestaService.enviarEncuestaMasiva - Error:', error);
            throw error;
        }
    }

    // Obtener estadísticas de encuesta
    async obtenerEstadisticas(encuestaId) {
        try {
            const response = await this.fetch(`${this.endpoint}/${encuestaId}/estadisticas`);
            return response;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }

    // Verificar si ya existe una encuesta para el evento/actividad
    async verificarEncuestaExistente(tipo, id, titulo) {
        try {
            let url;
            if (tipo === 'evento') {
                url = `${this.endpoint}?evento_id=${id}`;
            } else if (tipo === 'actividad') {
                url = `${this.endpoint}?actividad_id=${id}`;
            } else {
                throw new Error('Tipo no válido');
            }

            const response = await this.fetch(url);

            // Buscar si ya existe una encuesta con el mismo título
            if (response.success && response.data) {
                const encuestaExistente = response.data.find(
                    encuesta => encuesta.titulo.toLowerCase() === titulo.toLowerCase()
                );
                return {
                    existe: !!encuestaExistente,
                    encuesta: encuestaExistente
                };
            }

            return { existe: false, encuesta: null };
        } catch (error) {
            console.error('Error al verificar encuesta existente:', error);
            return { existe: false, encuesta: null };
        }
    }

    async completarEncuesta(idEncuesta, idAsistente) {
        try {
            console.log('🔍 encuestaService.completarEncuesta - Iniciando');
            console.log('🔍 Parámetros:', { idEncuesta, idAsistente });

            // Verifica que los parámetros sean válidos
            if (!idEncuesta || !idAsistente) {
                console.error('❌ Parámetros inválidos:', { idEncuesta, idAsistente });
                throw new Error('id_encuesta e id_asistente son requeridos');
            }

            // Verificar que tenemos token
            const token = this.getToken();
            if (!token) {
                console.error('❌ No hay token disponible');
                throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
            }

            console.log('🔑 Token (primeros 30 chars):', token.substring(0, 30) + '...');

            const endpoint = `${this.endpoint}/completar`;
            const urlCompleta = `${this.baseURL}${endpoint}`;

            console.log('🌐 URL completa:', urlCompleta);

            const body = JSON.stringify({
                id_encuesta: idEncuesta,
                id_asistente: idAsistente
            });

            console.log('📤 Body:', body);

            // Hacer la petición MANUALMENTE para ver qué pasa
            const response = await fetch(urlCompleta, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: body
            });

            console.log('📥 Response status:', response.status, response.statusText);

            const responseText = await response.text();
            console.log('📥 Response body:', responseText);

            let parsed;
            try {
                parsed = JSON.parse(responseText);
            } catch (e) {
                parsed = { __rawText: responseText };
            }

            if (!response.ok) {
                console.error('❌ Error en la respuesta:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: parsed
                });

                let errorMessage = 'Error al completar la encuesta';
                if (parsed.message) {
                    errorMessage = parsed.message;
                } else if (response.status === 401) {
                    errorMessage = 'Token inválido o expirado';
                } else if (response.status === 404) {
                    errorMessage = 'Endpoint no encontrado';
                }

                const error = new Error(errorMessage);
                error.status = response.status;
                error.data = parsed;
                throw error;
            }

            console.log('✅ encuestaService.completarEncuesta - Éxito:', parsed);
            return parsed;

        } catch (error) {
            console.error('❌ encuestaService.completarEncuesta - Error completo:', {
                message: error.message,
                status: error.status,
                stack: error.stack
            });
            throw error;
        }
    }

    async obtenerEventosConActividades() {
        try {
            console.log('🔍 encuestaService.obtenerEventosConActividades - Iniciando');

            const response = await this.fetch('/eventos');

            console.log('✅ Eventos con actividades obtenidos:', response);

            if (response.success && response.data) {
                // Formatear las actividades para incluir el campo 'id'
                response.data = response.data.map(evento => ({
                    ...evento,
                    actividades: evento.actividades ? evento.actividades.map(actividad => ({
                        id: actividad.id_actividad,
                        id_actividad: actividad.id_actividad,
                        titulo: actividad.titulo,
                        fecha_actividad: actividad.fecha_actividad,
                        id_evento: evento.id
                    })) : []
                }));
            }

            return response;
        } catch (error) {
            console.error('❌ Error al obtener eventos con actividades:', error);
            // Devolver estructura vacía para no romper el flujo
            return { success: true, data: [] };
        }
    }
}

const encuestaService = new EncuestaService();
export default encuestaService;