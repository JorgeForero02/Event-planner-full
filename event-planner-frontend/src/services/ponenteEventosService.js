import { API_URL } from '../config/apiConfig';
const API_BASE = API_URL;

export const ponenteEventosService = {
    /**
     * Obtiene eventos disponibles para que el ponente los vea
     */
    async obtenerEventosDisponibles(token) {
        try {

            const response = await fetch(`${API_BASE}/inscripciones/eventos-disponibles`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });


            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Error al obtener eventos disponibles');
            }

            return this.formatearEventosLista(result.data || []);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Obtiene detalles completos de un evento específico
     */
    async obtenerDetallesEvento(eventoId, token) {
        try {

            const response = await fetch(`${API_BASE}/eventos/${eventoId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });


            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success || !result.data) {
                throw new Error(result.message || 'Error al obtener detalles del evento');
            }

            return this.formatearDetallesEvento(result.data);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Formatea los eventos para la lista (más simple)
     */
    formatearEventosLista(eventos) {
        return eventos.map(evento => ({
            id: evento.id,
            titulo: evento.titulo || evento.nombre,
            descripcion: evento.descripcion,
            fecha_inicio: evento.fecha_inicio,
            fecha_fin: evento.fecha_fin,
            hora: evento.hora,
            modalidad: evento.modalidad,
            estado_evento: evento.estado || evento.estado_evento,
            cupo_total: evento.cupo_total,
            cupos_disponibles: evento.cupos_disponibles,
            empresa: evento.empresa,
            organizador: evento.organizador,
            correo_organizador: evento.correo_organizador,
            fecha_creacion: evento.fecha_creacion,
            fecha_actualizacion: evento.fecha_actualizacion,
            actividades: evento.actividades || []
        }));
    },

    /**
     * Formatea los detalles del evento (más robusto para objetos anidados)
     */
    formatearDetallesEvento(evento) {

        const extraerValorSeguro = (obj, posiblesClaves, defaultValue = 'No disponible') => {
            if (!obj) return defaultValue;

            if (typeof obj !== 'object') return obj;

            for (let clave of posiblesClaves) {
                if (obj[clave] !== undefined && obj[clave] !== null) {
                    return obj[clave];
                }
            }

            return defaultValue;
        };

        const organizadorObj = evento.organizador || evento.creador || {};
        const organizador = extraerValorSeguro(organizadorObj, ['nombre', 'nombre_completo', 'name'], 'No especificado');
        const correoOrganizador = extraerValorSeguro(organizadorObj, ['correo', 'email']);

        const empresa = extraerValorSeguro(evento.empresa, ['nombre', 'razon_social', 'name'], 'No especificada');

        let cuposDisponibles = evento.cupos_disponibles;
        if (cuposDisponibles === undefined || cuposDisponibles === null) {
            const inscritosCount = evento.inscritos_count || 0;
            const cupoTotal = evento.cupos || evento.cupo_total || 0;
            cuposDisponibles = Math.max(0, cupoTotal - inscritosCount);
        }

        return {
            id: evento.id,
            titulo: evento.titulo || evento.nombre || 'Sin título',
            descripcion: evento.descripcion || 'Sin descripción disponible',
            modalidad: evento.modalidad || 'No especificado',
            hora: evento.hora || '',
            fecha_inicio: evento.fecha_inicio,
            fecha_fin: evento.fecha_fin,
            lugar: evento.lugar || '',
            cupo_total: evento.cupos || evento.cupo_total || 0,
            cupos_disponibles: cuposDisponibles,
            estado_evento: evento.estado === 1 ? 'Disponible' : 'No disponible',
            empresa: empresa,
            estado: evento.estado,
            actividades: evento.actividades || [],
            creador: organizadorObj,
            fecha_creacion: evento.fecha_creacion,
            fecha_actualizacion: evento.fecha_actualizacion,
            organizador: organizador,
            correo_organizador: correoOrganizador,
            id_empresa: evento.id_empresa,
            id_creador: evento.id_creador,
            inscritos_count: evento.inscritos_count || 0
        };
    }
};

export default ponenteEventosService;