import { BaseService } from './baseService';

class EventsAPI extends BaseService {
    constructor() {
        super();
        this.obtenerEventos = this.obtenerEventos.bind(this);
        this.getEventsByEmpresa = this.getEventsByEmpresa.bind(this);
        this.obtenerEventosDisponibles = this.obtenerEventosDisponibles.bind(this);
    }

    obtenerEventos = async () => {
        try {
            const response = await this.fetch('/eventos');

            if (!response.success) {
                throw new Error(response.message || 'Error al obtener eventos');
            }

            return response;
        } catch (error) {
            console.error('Error en obtenerEventos:', error);
            throw new Error(error.message || 'Error al cargar los eventos');
        }
    }

    obtenerEventosDisponibles = async () => {
        try {
            const response = await this.fetch('/inscripciones/eventos-disponibles');

            if (!response.success) {
                // [FRONTEND-FIX] F5: Propagar error en lugar de enmascarar como éxito
                throw new Error(response.message || 'Error al obtener eventos disponibles');
            }

            return response;
        } catch (error) {
            console.error('Error en obtenerEventosDisponibles:', error);
            throw error;
        }
    }

    getEventsByEmpresa = async (empresaId) => {
        try {
            const response = await this.fetch(`/eventos?id_empresa=${empresaId}`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching events by empresa:', error);
            return [];
        }
    }
}

export const eventsAPI = new EventsAPI();