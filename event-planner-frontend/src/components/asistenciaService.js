const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('access_token') || localStorage.getItem('token');

const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
});

class AsistenciaService {
    async obtenerAsistenciasEvento(idEvento) {
        const response = await fetch(`${API_URL}/asistencias/evento/${idEvento}`, {
            headers: authHeaders(),
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        return response.json();
    }

    async obtenerEventos() {
        const usuario = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${API_URL}/eventos`, {
            headers: authHeaders(),
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const json = await response.json();
        const eventos = json.data || json;

        if (!usuario || !usuario.id) return eventos;
        return eventos.filter((ev) => ev.id_creador === usuario.id);
    }

    async actualizarAsistenciaManual(idAsistencia, estado) {
        const response = await fetch(`${API_URL}/asistencias/${idAsistencia}/manual`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({ estado }),
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        return response.json();
    }

    async exportarInscritosCSV(idEvento) {
        const response = await fetch(`${API_URL}/eventos/${idEvento}/inscritos/exportar-csv`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        return response.blob();
    }
}

const asistenciaService = new AsistenciaService();
export default asistenciaService;
