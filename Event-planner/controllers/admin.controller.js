const {
    Usuario,
    Administrador,
    AdministradorEmpresa,
    Ponente,
    Asistente,
    Inscripcion,
    Asistencia,
    Evento,
    Encuesta,
    RespuestaEncuesta,
    sequelize
} = require('../models');
const { Op } = require('sequelize');
const AuditoriaService = require('../services/auditoriaService');

const _rolesEstado = { gerente: true, organizador: true, ponente: true, asistente: true };

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
                totalEventosFinalizados,
                totalInscripciones,
                totalEncuestasEnviadas,
                totalEncuestasCompletadas,
                totalEncuestasActivas
            ] = await Promise.all([
                Usuario.count(),
                Administrador.count(),
                AdministradorEmpresa.count({ where: { es_Gerente: 1 } }),
                AdministradorEmpresa.count({ where: { es_Gerente: 0 } }),
                Ponente.count(),
                Asistente.count(),
                Evento.count({ where: { estado: 1 } }),
                Evento.count({ where: { estado: 2 } }),
                Inscripcion.count({ where: { estado: 'Confirmada' } }),
                RespuestaEncuesta.count(),
                RespuestaEncuesta.count({ where: { estado: 'completada' } }),
                Encuesta.count({ where: { estado: 'activa' } })
            ]);

            // Tasa global asistencia: asistencias registradas / inscripciones confirmadas
            const totalAsistencias = await Asistencia.count();
            const tasaGlobalAsistencia = totalInscripciones > 0
                ? Math.round((totalAsistencias / totalInscripciones) * 100)
                : 0;

            const tasaRespuestaEncuestas = totalEncuestasEnviadas > 0
                ? Math.round((totalEncuestasCompletadas / totalEncuestasEnviadas) * 100)
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
                    eventos_finalizados: totalEventosFinalizados,
                    total_inscripciones_confirmadas: totalInscripciones,
                    total_asistencias: totalAsistencias,
                    tasa_global_asistencia: tasaGlobalAsistencia,
                    encuestas: {
                        activas: totalEncuestasActivas,
                        total_enviadas: totalEncuestasEnviadas,
                        total_completadas: totalEncuestasCompletadas,
                        tasa_respuesta: tasaRespuestaEncuestas
                    }
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

    async listarRoles(req, res) {
        try {
            const [cntGerentes, cntOrganizadores, cntPonentes, cntAsistentes] = await Promise.all([
                AdministradorEmpresa.count({
                    where: { es_Gerente: 1 },
                    include: [{ model: Usuario, as: 'usuario', where: { activo: 1 }, attributes: [] }]
                }),
                AdministradorEmpresa.count({
                    where: { es_Gerente: 0 },
                    include: [{ model: Usuario, as: 'usuario', where: { activo: 1 }, attributes: [] }]
                }),
                Ponente.count({
                    include: [{ model: Usuario, as: 'usuario', where: { activo: 1 }, attributes: [] }]
                }),
                Asistente.count({
                    include: [{ model: Usuario, as: 'usuario', where: { activo: 1 }, attributes: [] }]
                })
            ]);

            const roles = [
                { tipo: 'gerente', nombre: 'Gerente', activo: _rolesEstado.gerente, usuarios_activos: cntGerentes },
                { tipo: 'organizador', nombre: 'Organizador', activo: _rolesEstado.organizador, usuarios_activos: cntOrganizadores },
                { tipo: 'ponente', nombre: 'Ponente', activo: _rolesEstado.ponente, usuarios_activos: cntPonentes },
                { tipo: 'asistente', nombre: 'Asistente', activo: _rolesEstado.asistente, usuarios_activos: cntAsistentes }
            ];

            return res.json({ success: true, data: roles });
        } catch (error) {
            console.error('Error al listar roles:', error);
            return res.status(500).json({ success: false, message: 'Error al obtener roles' });
        }
    }

    async toggleRolEstado(req, res) {
        try {
            const { tipo } = req.params;
            const { activo } = req.body;
            const usuario = req.usuario;

            const tiposValidos = ['gerente', 'organizador', 'ponente', 'asistente'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({ success: false, message: 'Tipo de rol inválido' });
            }

            if (activo === false || activo === 0) {
                let usuariosActivos = 0;
                if (tipo === 'gerente') {
                    usuariosActivos = await AdministradorEmpresa.count({
                        where: { es_Gerente: 1 },
                        include: [{ model: Usuario, as: 'usuario', where: { activo: 1 }, attributes: [] }]
                    });
                } else if (tipo === 'organizador') {
                    usuariosActivos = await AdministradorEmpresa.count({
                        where: { es_Gerente: 0 },
                        include: [{ model: Usuario, as: 'usuario', where: { activo: 1 }, attributes: [] }]
                    });
                } else if (tipo === 'ponente') {
                    usuariosActivos = await Ponente.count({
                        include: [{ model: Usuario, as: 'usuario', where: { activo: 1 }, attributes: [] }]
                    });
                } else if (tipo === 'asistente') {
                    usuariosActivos = await Asistente.count({
                        include: [{ model: Usuario, as: 'usuario', where: { activo: 1 }, attributes: [] }]
                    });
                }

                if (usuariosActivos > 0) {
                    return res.status(409).json({
                        success: false,
                        message: `No se puede deshabilitar el rol "${tipo}": tiene ${usuariosActivos} usuario(s) activo(s) asignado(s). Reasigne o desactive esos usuarios primero.`,
                        usuarios_activos: usuariosActivos
                    });
                }
            }

            _rolesEstado[tipo] = activo === true || activo === 1;

            await AuditoriaService.registrar({
                mensaje: `Rol "${tipo}" ${_rolesEstado[tipo] ? 'habilitado' : 'deshabilitado'} por el administrador`,
                tipo: 'PATCH',
                accion: 'toggle_rol_estado',
                usuario: { id: usuario.id, nombre: usuario.nombre }
            });

            return res.json({
                success: true,
                message: `Rol "${tipo}" ${_rolesEstado[tipo] ? 'habilitado' : 'deshabilitado'} exitosamente`,
                data: { tipo, activo: _rolesEstado[tipo] }
            });
        } catch (error) {
            console.error('Error al cambiar estado de rol:', error);
            return res.status(500).json({ success: false, message: 'Error al actualizar rol' });
        }
    }

    async exportarDashboardCSV(req, res) {
        try {
            const [
                totalUsuarios, totalAdmins, totalGerentes, totalOrganizadores,
                totalPonentes, totalAsistentes, eventosActivos, totalEventosFinalizados,
                totalInscripciones, totalEncuestasEnviadas, totalEncuestasCompletadas, totalEncuestasActivas
            ] = await Promise.all([
                Usuario.count(), Administrador.count(),
                AdministradorEmpresa.count({ where: { es_Gerente: 1 } }),
                AdministradorEmpresa.count({ where: { es_Gerente: 0 } }),
                Ponente.count(), Asistente.count(),
                Evento.count({ where: { estado: 1 } }),
                Evento.count({ where: { estado: 2 } }),
                Inscripcion.count({ where: { estado: 'Confirmada' } }),
                RespuestaEncuesta.count(),
                RespuestaEncuesta.count({ where: { estado: 'completada' } }),
                Encuesta.count({ where: { estado: 'activa' } })
            ]);

            const totalAsistencias = await Asistencia.count();
            const tasaAsistencia = totalInscripciones > 0
                ? Math.round((totalAsistencias / totalInscripciones) * 100) : 0;
            const tasaEncuestas = totalEncuestasEnviadas > 0
                ? Math.round((totalEncuestasCompletadas / totalEncuestasEnviadas) * 100) : 0;

            const filas = [
                ['Métrica', 'Valor'],
                ['Total Usuarios', totalUsuarios],
                ['Administradores', totalAdmins],
                ['Gerentes', totalGerentes],
                ['Organizadores', totalOrganizadores],
                ['Ponentes', totalPonentes],
                ['Asistentes', totalAsistentes],
                ['Eventos Activos', eventosActivos],
                ['Eventos Finalizados', totalEventosFinalizados],
                ['Inscripciones Confirmadas', totalInscripciones],
                ['Total Asistencias', totalAsistencias],
                ['Tasa Global de Asistencia (%)', tasaAsistencia],
                ['Encuestas Activas', totalEncuestasActivas],
                ['Encuestas Enviadas', totalEncuestasEnviadas],
                ['Encuestas Completadas', totalEncuestasCompletadas],
                ['Tasa de Respuesta Encuestas (%)', tasaEncuestas]
            ];

            const csv = filas.map(f => f.join(',')).join('\n');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="dashboard_admin.csv"');
            return res.send('\uFEFF' + csv);
        } catch (error) {
            console.error('Error al exportar dashboard CSV:', error);
            return res.status(500).json({ success: false, message: 'Error al exportar CSV' });
        }
    }
}

module.exports = new AdminController();
