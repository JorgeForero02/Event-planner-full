export const formatFecha = (fecha) => {
    if (!fecha) return 'Fecha no definida';
    try {
        const fechaObj = new Date(fecha + 'T00:00:00');
        return fechaObj.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        });
    } catch (e) {
        return fecha;
    }
};

export const formatHora = (hora) => {
    if (!hora) return '';
    if (hora.includes(':')) {
        return hora.substring(0, 5);
    }
    return hora;
};

export const formatFechaCompleta = (fecha) => {
    if (!fecha) return 'Fecha no definida';
    try {
        const fechaObj = new Date(fecha);
        return fechaObj.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        });
    } catch (e) {
        return fecha;
    }
};

export const formatRangoFechas = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return 'Fechas no disponibles';

    try {
        const inicio = new Date(fechaInicio + 'T00:00:00');
        const fin = new Date(fechaFin + 'T00:00:00');

        const opciones = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        };

        const fechaInicioStr = inicio.toLocaleDateString('es-ES', opciones);
        const fechaFinStr = fin.toLocaleDateString('es-ES', opciones);

        if (fechaInicio === fechaFin) {
            return fechaInicioStr;
        }

        return `${fechaInicioStr} al ${fechaFinStr}`;
    } catch (e) {
        return `${fechaInicio} al ${fechaFin}`;
    }
};

export const debugFecha = (fecha, label = 'Fecha') => {
    if (!fecha) {
        return;
    }

    try {
        new Date(fecha + 'T00:00:00');
    } catch (e) {
    }
};