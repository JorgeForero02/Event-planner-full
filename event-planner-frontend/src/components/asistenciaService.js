import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class AsistenciaService {
    async obtenerAsistenciasEvento(idEvento) {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token');
            const response = await axios.get(`${API_URL}/asistencias/evento/${idEvento}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async obtenerEventos() {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token');
            const usuario = JSON.parse(localStorage.getItem('user'));

            const response = await axios.get(`${API_URL}/eventos`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const eventos = response.data.data || response.data;

            if (!usuario || !usuario.id) {
                return eventos;
            }

            const eventosFiltrados = eventos.filter(
                (ev) => ev.id_creador === usuario.id
            );

            return eventosFiltrados;
        } catch (error) {
            throw error;
        }
    }

    async actualizarAsistenciaManual(idAsistencia, estado) {
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            const response = await axios.patch(
                `${API_URL}/asistencias/${idAsistencia}/manual`,
                { estado },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async exportarInscritosCSV(idEvento) {
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/eventos/${idEvento}/inscritos/exportar-csv`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );
            return response;
        } catch (error) {
            throw error;
        }
    }
}

const asistenciaService = new AsistenciaService();
export default asistenciaService;
