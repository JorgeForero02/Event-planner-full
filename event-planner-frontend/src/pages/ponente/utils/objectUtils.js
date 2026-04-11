export const safeRender = (value, defaultValue = 'No disponible') => {
    if (value === undefined || value === null) return defaultValue;

    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';

    if (typeof value === 'object') {
        if (value.nombre) return value.nombre;
        if (value.nombre_completo) return value.nombre_completo;
        if (value.correo) return value.correo;
        if (value.email) return value.email;
        if (value.razon_social) return value.razon_social;

        if (value.fecha) return value.fecha;
        if (value.createdAt) return value.createdAt;
        if (value.updatedAt) return value.updatedAt;

        if (Array.isArray(value)) return `${value.length} elementos`;

        return `[Objeto]`;
    }

    return String(value);
};