const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = 'gpt-4o-mini';

class IAService {
    async generarMensaje({ evento, tipo_mensaje, contexto_adicional }) {
        const tipoDescripcion = {
            recordatorio: 'recordatorio previo al evento',
            modificacion: 'notificación de cambio en el evento',
            cancelacion: 'notificación de cancelación del evento',
            bienvenida: 'mensaje de bienvenida a los inscritos',
            general: 'comunicación general sobre el evento'
        }[tipo_mensaje] || 'mensaje relacionado con el evento';

        const prompt = this._construirPromptMensaje(evento, tipoDescripcion, contexto_adicional);

        const respuesta = await client.chat.completions.create({
            model: MODEL,
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }]
        });

        return respuesta.choices[0].message.content.trim();
    }

    async generarDescripcion({ evento, tono }) {
        const tonoDescripcion = {
            formal: 'formal y profesional',
            amigable: 'amigable y cercano',
            motivador: 'motivador e inspirador'
        }[tono] || 'profesional y claro';

        const prompt = this._construirPromptDescripcion(evento, tonoDescripcion);

        const respuesta = await client.chat.completions.create({
            model: MODEL,
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }]
        });

        return respuesta.choices[0].message.content.trim();
    }

    _construirPromptMensaje(evento, tipoDescripcion, contextoAdicional) {
        const detalles = [
            `Nombre del evento: ${evento.titulo}`,
            evento.fecha_inicio ? `Fecha de inicio: ${evento.fecha_inicio}` : null,
            evento.fecha_fin ? `Fecha de fin: ${evento.fecha_fin}` : null,
            evento.modalidad ? `Modalidad: ${evento.modalidad}` : null,
            evento.descripcion ? `Descripción: ${evento.descripcion}` : null,
            evento.lugar ? `Lugar: ${evento.lugar}` : null,
            contextoAdicional ? `Contexto adicional: ${contextoAdicional}` : null
        ].filter(Boolean).join('\n');

        return `Eres un asistente de comunicación para una plataforma de gestión de eventos corporativos. Redacta un ${tipoDescripcion} para los participantes del siguiente evento:\n\n${detalles}\n\nEl mensaje debe ser claro, profesional, breve (máximo 3 párrafos) y en español. No incluyas saludos genéricos como "Estimado usuario". Devuelve únicamente el cuerpo del mensaje, sin asunto ni firma.`;
    }

    _construirPromptDescripcion(evento, tonoDescripcion) {
        const detalles = [
            `Nombre: ${evento.titulo}`,
            evento.fecha_inicio ? `Fecha: ${evento.fecha_inicio}` : null,
            evento.modalidad ? `Modalidad: ${evento.modalidad}` : null,
            evento.cupos ? `Cupos disponibles: ${evento.cupos}` : null,
            evento.descripcion_actual ? `Descripción actual (mejorar o reemplazar): ${evento.descripcion_actual}` : null,
            evento.actividades && evento.actividades.length > 0
                ? `Actividades: ${evento.actividades.map(a => a.titulo).join(', ')}`
                : null
        ].filter(Boolean).join('\n');

        return `Eres un asistente de comunicación para una plataforma de gestión de eventos corporativos. Genera una descripción completa y atractiva en tono ${tonoDescripcion} para el siguiente evento:\n\n${detalles}\n\nLa descripción debe tener entre 100 y 250 palabras, en español, y comunicar claramente el valor del evento para los asistentes. Devuelve únicamente el texto de la descripción.`;
    }
}

module.exports = new IAService();
