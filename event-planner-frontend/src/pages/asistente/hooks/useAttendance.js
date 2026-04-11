import { useState } from 'react';
import { attendanceService } from '../../../services/attendanceService';

export const useAttendance = () => {
    const [asistenciasRegistradas, setAsistenciasRegistradas] = useState(new Set());
    const [registrandoAsistencia, setRegistrandoAsistencia] = useState(false);
    const [inscripcionRegistrando, setInscripcionRegistrando] = useState(null);
    const [error, setError] = useState(null);

    const handleRegistrarAsistencia = async (inscripcion) => {
        try {
            setRegistrandoAsistencia(true);
            setInscripcionRegistrando(inscripcion.id);
            setError(null);

            const token = localStorage.getItem('access_token');

            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            await attendanceService.registerAttendance(inscripcion.codigo, token);

            setAsistenciasRegistradas(prev => new Set([...prev, inscripcion.id]));

            return { success: true, message: 'Asistencia registrada exitosamente' };
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setRegistrandoAsistencia(false);
            setInscripcionRegistrando(null);
        }
    };

    const actualizarAsistenciasDesdeInscripciones = (inscripciones) => {
        const nuevasAsistencias = new Set();
        const hoy = new Date().toISOString().split('T')[0];


        inscripciones.forEach(inscripcion => {
            if (inscripcion.asistencias && Array.isArray(inscripcion.asistencias)) {
                const asistenciaHoy = inscripcion.asistencias.some(asistencia =>
                    asistencia.fecha === hoy && asistencia.estado === 'Presente'
                );
                if (asistenciaHoy) {
                    nuevasAsistencias.add(inscripcion.id);
                }
            }
        });

        setAsistenciasRegistradas(nuevasAsistencias);
    };

    return {
        asistenciasRegistradas,
        registrandoAsistencia,
        inscripcionRegistrando,
        error,
        handleRegistrarAsistencia,
        actualizarAsistenciasDesdeInscripciones
    };
};