import { BaseService } from './api/baseService';

class EncuestaService extends BaseService {
    constructor() {
        super();
        this.endpoint = '/encuestas';
    }

    async obtenerPorActividad(actividadId) {
        try {
            const response = await this.fetch(`${this.endpoint}?actividad_id=${actividadId}`);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async obtenerPorEvento(eventoId) {
        try {
            const response = await this.fetch(`${this.endpoint}?evento_id=${eventoId}`);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async crearEncuesta(encuestaData) {
        try {

            if (!encuestaData.id_evento && !encuestaData.id_actividad) {
                throw new Error('Debe asociar la encuesta a un evento o actividad');
            }

            const response = await this.fetch(this.endpoint, {
                method: 'POST',
                body: JSON.stringify({
                    ...encuestaData,
                    estado: 'borrador'
                })
            });

            return response;
        } catch (error) {
            throw error;
        }
    }

    async obtenerPorId(encuestaId) {
        try {
            const response = await this.fetch(`${this.endpoint}/${encuestaId}`);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async actualizarEncuesta(encuestaId, datosActualizacion) {
        try {

            const response = await this.fetch(`${this.endpoint}/${encuestaId}`, {
                method: 'PUT',
                body: JSON.stringify(datosActualizacion)
            });

            return response;
        } catch (error) {
            throw error;
        }
    }

    async eliminarEncuesta(encuestaId) {
        try {
            const response = await this.fetch(`${this.endpoint}/${encuestaId}`, {
                method: 'DELETE'
            });
            return response;
        } catch (error) {
            throw error;
        }
    }

    async enviarEncuestaMasiva(encuestaId) {
        try {

            const response = await this.fetch(`${this.endpoint}/${encuestaId}/enviar`, {
                method: 'POST'
            });

            return response;
        } catch (error) {
            throw error;
        }
    }

    async obtenerEstadisticas(encuestaId) {
        try {
            const response = await this.fetch(`${this.endpoint}/${encuestaId}/estadisticas`);
            return response;
        } catch (error) {
            throw error;
        }
    }

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
            return { existe: false, encuesta: null };
        }
    }

    async completarEncuesta(idEncuesta, idAsistente) {
        try {

            if (!idEncuesta || !idAsistente) {
                throw new Error('id_encuesta e id_asistente son requeridos');
            }

            const token = this.getToken();
            if (!token) {
                throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
            }


            const endpoint = `${this.endpoint}/completar`;
            const urlCompleta = `${this.baseURL}${endpoint}`;


            const body = JSON.stringify({
                id_encuesta: idEncuesta,
                id_asistente: idAsistente
            });


            const response = await fetch(urlCompleta, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: body
            });


            const responseText = await response.text();

            let parsed;
            try {
                parsed = JSON.parse(responseText);
            } catch (e) {
                parsed = { __rawText: responseText };
            }

            if (!response.ok) {
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

            return parsed;

        } catch (error) {
            console.error({
                message: error.message,
                status: error.status,
                stack: error.stack
            });
            throw error;
        }
    }

    async obtenerEventosConActividades() {
        try {

            const response = await this.fetch('/eventos');


            if (response.success && response.data) {
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
            return { success: true, data: [] };
        }
    }
}

const encuestaService = new EncuestaService();
export default encuestaService;