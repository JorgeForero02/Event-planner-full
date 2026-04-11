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
    const data = await handleResponse(res);
    if (data && typeof data === 'object' && data.descripcion_generada) return data.descripcion_generada;
    return typeof data === 'string' ? data : String(data);
};

export const generarMensaje = async (id_evento, tipo_mensaje, contexto_adicional) => {
    const res = await fetch(`${API_URL}/ia/generar-mensaje`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ id_evento, tipo_mensaje, contexto_adicional: contexto_adicional || undefined })
    });
    const data = await handleResponse(res);
    if (data && typeof data === 'object' && data.texto_generado) return data.texto_generado;
    return typeof data === 'string' ? data : String(data);
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

export const planificarConIA = async (mensaje, historial, contexto) => {
    const res = await fetch(`${API_URL}/ia/planificar-evento`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            mensaje,
            historial: historial || [],
            contexto: contexto || {}
        })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error en la solicitud');
    return data.data || { mensaje: 'Sin respuesta del asistente', estructura: null };
};
