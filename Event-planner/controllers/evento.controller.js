const EventoService = require('../services/evento.service');
const EventoValidator = require('../validators/evento.validator');
const PermisosService = require('../services/permisos.service');
const AuditoriaService = require('../services/auditoriaService');
const EmailService = require('../services/emailService');
const NotificacionService = require('../services/notificacion.service');
const { MENSAJES, ESTADOS } = require('../constants/evento.constants');

class EventoController {
    async crearEvento(req, res) {
        const transaction = await EventoService.crearTransaccion();

        try {
            const usuario = req.usuario;
            const empresaId = req.body.id_empresa || req.adminEmpresa?.id_empresa;

            const validacion = await EventoValidator.validarCreacion(req.body, empresaId);

            if (!validacion.esValida) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: validacion.mensaje
                });
            }

            const resultado = await EventoService.crear({
                ...req.body,
                id_empresa: empresaId,
                id_creador: usuario.id
            }, transaction);

            await AuditoriaService.registrar({
                mensaje: `Se creó el evento: ${resultado.evento.titulo}`,
                tipo: 'POST',
                accion: 'crear_evento',
                usuario: { id: usuario.id, nombre: usuario.nombre }
            });

            await transaction.commit();

            return res.status(201).json({
                success: true,
                message: MENSAJES.CREADO,
                data: {
                    id: resultado.evento.id,
                    titulo: resultado.evento.titulo,
                    modalidad: resultado.evento.modalidad,
                    estado: resultado.evento.estado,
                    fecha_inicio: resultado.evento.fecha_inicio,
                    fecha_fin: resultado.evento.fecha_fin,
                    id_empresa: resultado.evento.id_empresa,
                    id_creador: resultado.evento.id_creador
                }
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error al crear evento:', error);
            return res.status(500).json({
                success: false,
                message: MENSAJES.ERROR_CREAR,
                error: error.message
            });
        }
    }

    async obtenerEventos(req, res) {
        try {
            const { id_empresa, estado, modalidad } = req.query;
            const usuario = req.usuario;

            const whereClause = EventoService.construirFiltros({
                id_empresa,
                estado,
                modalidad,
                rol: usuario.rol,
                empresaUsuario: usuario.rolData?.id_empresa
            });

            const eventos = await EventoService.obtenerTodos(whereClause);

            return res.json({
                success: true,
                message: MENSAJES.LISTA_OBTENIDA,
                total: eventos.length,
                data: eventos
            });
        } catch (error) {
            console.error('Error al obtener eventos:', error);
            return res.status(500).json({
                success: false,
                message: MENSAJES.ERROR_OBTENER,
                error: error.message
            });
        }
    }

    async obtenerEventoById(req, res) {
        try {
            const { eventoId } = req.params;
            const usuario = req.usuario;

            const whereClause = EventoService.construirFiltros({
                id: eventoId,
                rol: usuario.rol,
                empresaUsuario: usuario.rolData?.id_empresa
            });

            const evento = await EventoService.buscarUno(whereClause);

            if (!evento) {
                return res.status(404).json({
                    success: false,
                    message: MENSAJES.NO_ENCONTRADO_O_SIN_PERMISO
                });
            }

            return res.json({
                success: true,
                message: MENSAJES.OBTENIDO,
                data: evento
            });
        } catch (error) {
            console.error('Error al obtener evento:', error);
            return res.status(500).json({
                success: false,
                message: MENSAJES.ERROR_OBTENER,
                error: error.message
            });
        }
    }

    async actualizarEvento(req, res) {
        const transaction = await EventoService.crearTransaccion();

        try {
            const eventoActualizado = req.evento;

            // [BACKEND-FIX] B13: Pasar evento actual para validación cruzada de fechas
            const errorValidacion = EventoValidator.validarActualizacion(req.body, eventoActualizado);

            if (errorValidacion) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: errorValidacion
                });
            }

            // [BACKEND-FIX] B5: Validar estado antes de permitir actualización
            const nuevoEstado = req.body.estado !== undefined ? Number(req.body.estado) : undefined;
            const errorEstado = EventoValidator.validarEstado(eventoActualizado.estado, nuevoEstado);
            if (errorEstado) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: errorEstado
                });
            }

            const validacionAgenda = await EventoValidator.validarAgenda(eventoActualizado.id);
            
            if (!validacionAgenda.esValida) {
                await transaction.rollback();
                return res.status(409).json({
                    success: false,
                    message: validacionAgenda.mensaje
                });
            }

            const actualizaciones = EventoService.construirActualizaciones(req.body);

            await eventoActualizado.update(actualizaciones, { transaction });

            await AuditoriaService.registrar({
                mensaje: `Se actualizó el evento: ${eventoActualizado.titulo}`,
                tipo: 'PUT',
                accion: 'actualizar_evento',
                usuario: { id: req.usuario.id, nombre: req.usuario.nombre }
            });

            await transaction.commit();

            return res.json({
                success: true,
                message: MENSAJES.ACTUALIZADO,
                data: eventoActualizado
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error al actualizar evento:', error);
            return res.status(500).json({
                success: false,
                message: MENSAJES.ERROR_ACTUALIZAR,
                error: error.message
            });
        }
    }

    // RF80 — Reporte de evento
    async obtenerReporte(req, res) {
        try {
            const { eventoId } = req.params;
            const reporte = await EventoService.obtenerReporte(eventoId);
            if (!reporte) {
                return res.status(404).json({ success: false, message: MENSAJES.NO_ENCONTRADO_O_SIN_PERMISO });
            }
            return res.json({ success: true, data: reporte });
        } catch (error) {
            console.error('Error al obtener reporte:', error);
            return res.status(500).json({ success: false, message: MENSAJES.ERROR_OBTENER });
        }
    }

    // RF81 — Presupuesto total del evento
    async obtenerPresupuesto(req, res) {
        try {
            const { eventoId } = req.params;
            const presupuesto = await EventoService.obtenerPresupuestoTotal(eventoId);
            if (!presupuesto) {
                return res.status(404).json({ success: false, message: MENSAJES.NO_ENCONTRADO_O_SIN_PERMISO });
            }
            return res.json({ success: true, data: presupuesto });
        } catch (error) {
            console.error('Error al obtener presupuesto:', error);
            return res.status(500).json({ success: false, message: MENSAJES.ERROR_OBTENER });
        }
    }

    async eliminarEvento(req, res) {
        const transaction = await EventoService.crearTransaccion();
        try {
            const eventoActualizado = req.evento;

            await eventoActualizado.update(
                { estado: ESTADOS.CANCELADO, fecha_actualizacion: new Date() },
                { transaction }
            );

            await AuditoriaService.registrar({
                mensaje: `Se canceló el evento: ${eventoActualizado.titulo}`,
                tipo: 'DELETE',
                accion: 'cancelar_evento',
                usuario: { id: req.usuario.id, nombre: req.usuario.nombre }
            });

            transaction.afterCommit(async () => {
                try {
                    const { participantes, creador } = await EventoService.obtenerNotificacionesCancelacion(eventoActualizado);
                    const correoDelCreador = creador ? creador.correo : null;

                    for (const usuario of participantes) {
                        await EmailService.enviarNotificacionCancelacion(
                            usuario.correo,
                            usuario.nombre,
                            eventoActualizado.titulo,
                            correoDelCreador
                        );
                    }

                    if (creador) {
                        await EmailService.enviarConfirmacionCancelacionCreador(
                            creador.correo,
                            creador.nombre,
                            eventoActualizado.titulo
                        );
                    }

                    await NotificacionService.crearNotificacionEventoCancelado(
                        eventoActualizado,
                        participantes,
                        creador
                    );
                } catch (notificationError) {
                    console.error('Error al enviar notificaciones de cancelación:', notificationError);
                }
            });

            await transaction.commit();

            return res.json({
                success: true,
                message: MENSAJES.CANCELADO
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error al eliminar evento:', error);
            return res.status(500).json({
                success: false,
                message: MENSAJES.ERROR_CANCELAR,
                error: error.message
            });
        }
    }
}

module.exports = new EventoController();
