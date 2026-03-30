const { Empresa, Usuario, AdministradorEmpresa, Asistente, Pais, Ciudad, sequelize } = require('../models');
const { MENSAJES, ESTADOS, ROLES } = require('../constants/empresa.constants');

class EmpresaService {
    async obtenerPorRol(rol, rolData, incluirPendientes) {
        const whereClause = this._construirWhereClause(rol, incluirPendientes);

        if (rol === 'administrador') {
            return await Empresa.findAll({
                where: whereClause,
                order: [['id', 'ASC']]
            });
        }

        if (rol === 'gerente' || rol === 'organizador') {
            return await Empresa.findAll({
                where: {
                    id: rolData.id_empresa,
                    ...whereClause
                },
                order: [['id', 'ASC']]
            });
        }

        return [];
    }

    async buscarPorId(id) {
        return await Empresa.findByPk(id);
    }

    async crear(datos, rol, usuarioId) {
        const estado = rol === 'asistente' ? ESTADOS.PENDIENTE : ESTADOS.ACTIVO;

        // [BACKEND-FIX] B3: Whitelist de campos para prevenir mass-assignment
        const camposPermitidos = ['nit', 'nombre', 'direccion', 'telefono', 'correo', 'id_pais', 'id_ciudad'];
        const datosFiltrados = {};
        camposPermitidos.forEach(campo => {
            if (datos[campo] !== undefined) {
                datosFiltrados[campo] = datos[campo];
            }
        });

        const empresaData = {
            ...datosFiltrados,
            estado,
            ...(rol === 'asistente' && { id_creador: usuarioId })
        };

        // [BACKEND-FIX] B11: Validar existencia de FK y unicidad de NIT antes de crear
        if (datosFiltrados.id_pais) {
            const pais = await Pais.findByPk(datosFiltrados.id_pais);
            if (!pais) {
                throw new Error('El país especificado no existe');
            }
        }
        if (datosFiltrados.id_ciudad) {
            const ciudad = await Ciudad.findByPk(datosFiltrados.id_ciudad);
            if (!ciudad) {
                throw new Error('La ciudad especificada no existe');
            }
        }
        if (datosFiltrados.nit) {
            const empresaExistente = await Empresa.findOne({ where: { nit: datosFiltrados.nit } });
            if (empresaExistente) {
                throw new Error('Ya existe una empresa registrada con este NIT');
            }
        }

        const empresa = await Empresa.create(empresaData);

        let usuario = null;
        if (rol === 'asistente') {
            usuario = await Usuario.findByPk(usuarioId);
        }

        const mensaje = rol === 'asistente'
            ? MENSAJES.CREADA_PENDIENTE
            : MENSAJES.CREADA;

        return { empresa, usuario, mensaje };
    }

    async actualizar(id, datos) {
        const empresa = await this.buscarPorId(id);

        if (!empresa) {
            return {
                exito: false,
                mensaje: MENSAJES.NO_ENCONTRADA
            };
        }

        // [BACKEND-FIX] B3: Whitelist de campos para prevenir mass-assignment
        const camposPermitidos = ['nit', 'nombre', 'direccion', 'telefono', 'correo', 'id_pais', 'id_ciudad'];
        const datosFiltrados = {};
        camposPermitidos.forEach(campo => {
            if (datos[campo] !== undefined) {
                datosFiltrados[campo] = datos[campo];
            }
        });

        const datosAnteriores = { ...empresa.toJSON() };
        await empresa.update(datosFiltrados);

        return {
            exito: true,
            empresa,
            datosAnteriores,
            datosNuevos: empresa.toJSON()
        };
    }

    async eliminar(id) {
        const empresa = await this.buscarPorId(id);

        if (!empresa) {
            return {
                exito: false,
                mensaje: MENSAJES.NO_ENCONTRADA
            };
        }

        await empresa.destroy();

        return { exito: true };
    }

    async obtenerEquipo(empresaId) {
        const equipo = await AdministradorEmpresa.findAll({
            where: { id_empresa: empresaId },
            include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['id', 'nombre', 'cedula', 'telefono', 'correo']
            }],
            order: [['es_Gerente', 'DESC'], ['id', 'ASC']]
        });

        return equipo.map(miembro => ({
            id: miembro.id,
            usuario: miembro.usuario,
            rol: miembro.es_Gerente === ROLES.GERENTE ? 'gerente' : 'organizador'
        }));
    }

    async obtenerPendientes() {
        return await Empresa.findAll({
            where: { estado: ESTADOS.PENDIENTE },
            include: [{
                model: Usuario,
                as: 'creador',
                attributes: ['id', 'nombre', 'correo', 'telefono']
            }],
            order: [['id', 'DESC']]
        });
    }

    async obtenerAprobadas() {
        return await Empresa.findAll({
            where: { estado: ESTADOS.ACTIVO },
            order: [['id', 'DESC']]
        });
    }

    async obtenerRechazadas() {
        return await Empresa.findAll({
            where: { estado: ESTADOS.RECHAZADO },
            order: [['id', 'DESC']]
        });
    }

    async procesarAprobacion(id, aprobar, motivo) {
        const empresa = await Empresa.findByPk(id);

        if (!empresa) {
            return {
                exito: false,
                mensaje: MENSAJES.NO_ENCONTRADA,
                codigoEstado: 404
            };
        }

        if (empresa.estado !== ESTADOS.PENDIENTE) {
            return {
                exito: false,
                mensaje: MENSAJES.YA_PROCESADA,
                codigoEstado: 400
            };
        }

        // [BACKEND-FIX] B12: Coerción booleana explícita para evitar que "false" (string) sea truthy
        const aprobado = aprobar === true || aprobar === 'true';
        const nuevoEstado = aprobado ? ESTADOS.ACTIVO : ESTADOS.RECHAZADO;

        let creador = null;

        await sequelize.transaction(async (t) => {
            await empresa.update({ estado: nuevoEstado }, { transaction: t });

            if (empresa.id_creador) {
                creador = await Usuario.findByPk(empresa.id_creador, { transaction: t });
            }

            // Ascender al asistente a gerente cuando la empresa es aprobada
            if (aprobado && empresa.id_creador) {
                // Eliminar la fila de Asistente
                await Asistente.destroy({
                    where: { id_usuario: empresa.id_creador },
                    transaction: t
                });

                // Registrar como gerente de la empresa recién aprobada
                await AdministradorEmpresa.create({
                    id_usuario: empresa.id_creador,
                    id_empresa: empresa.id,
                    es_Gerente: ROLES.GERENTE
                }, { transaction: t });
            }
        });

        const mensaje = aprobado ? MENSAJES.APROBADA : MENSAJES.RECHAZADA;

        return {
            exito: true,
            empresa,
            creador,
            mensaje
        };
    }

    _construirWhereClause(rol, incluirPendientes) {
        if (rol === 'administrador') {
            return incluirPendientes === 'true' ? {} : { estado: ESTADOS.ACTIVO };
        }
        return { estado: ESTADOS.ACTIVO };
    }
}

module.exports = new EmpresaService();