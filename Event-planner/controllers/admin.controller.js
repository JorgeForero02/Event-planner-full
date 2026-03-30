const {
    Usuario,
    Administrador,
    AdministradorEmpresa,
    Ponente,
    Asistente,
    Inscripcion,
    Asistencia,
    Evento,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

class AdminController {
    // RF10/RF13 — Dashboard stats del administrador
    async obtenerDashboardStats(req, res) {
        try {
            const [
                totalUsuarios,
                totalAdmins,
                totalGerentes,
                totalOrganizadores,
                totalPonentes,
                totalAsistentes,
                eventosActivos,
                totalInscripciones
            ] = await Promise.all([
                Usuario.count(),
                Administrador.count(),
                AdministradorEmpresa.count({ where: { es_Gerente: 1 } }),
                AdministradorEmpresa.count({ where: { es_Gerente: 0 } }),
                Ponente.count(),
                Asistente.count(),
                Evento.count({ where: { estado: 1 } }),
                Inscripcion.count({ where: { estado: 'Confirmada' } })
            ]);

            // Tasa global asistencia: asistencias registradas / inscripciones confirmadas
            const totalAsistencias = await Asistencia.count();
            const tasaGlobalAsistencia = totalInscripciones > 0
                ? Math.round((totalAsistencias / totalInscripciones) * 100)
                : 0;

            return res.json({
                success: true,
                data: {
                    usuarios_por_rol: {
                        administrador: totalAdmins,
                        gerente: totalGerentes,
                        organizador: totalOrganizadores,
                        ponente: totalPonentes,
                        asistente: totalAsistentes,
                        total: totalUsuarios
                    },
                    eventos_activos: eventosActivos,
                    total_inscripciones_confirmadas: totalInscripciones,
                    total_asistencias: totalAsistencias,
                    tasa_global_asistencia: tasaGlobalAsistencia
                }
            });
        } catch (error) {
            console.error('Error al obtener stats del dashboard:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas del dashboard'
            });
        }
    }
}

module.exports = new AdminController();
