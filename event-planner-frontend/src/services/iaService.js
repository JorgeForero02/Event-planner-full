import { API_URL } from '../config/apiConfig';

const getToken = () => localStorage.getItem('access_token');

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`
});

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error en la solicitud');
    return data.data;
};

export const generarDescripcion = async (id_evento, tono) => {
    const res = await fetch(`${API_URL}/ia/generar-descripcion`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ id_evento, tono })
    });
    return handleResponse(res);
};

export const generarMensaje = async (id_evento, tipo_mensaje, contexto_adicional) => {
    const res = await fetch(`${API_URL}/ia/generar-mensaje`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ id_evento, tipo_mensaje, contexto_adicional: contexto_adicional || undefined })
    });
    return handleResponse(res);
};

export const consultarChatbot = async (pregunta, id_evento) => {
    const body = { pregunta };
    if (id_evento) body.id_evento = id_evento;
    const res = await fetch(`${API_URL}/chatbot/consultar`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error en la solicitud');
    const result = data.data;
    if (result && typeof result === 'object' && result.respuesta) return result.respuesta;
    if (typeof result === 'string') return result;
    return String(result);
};
