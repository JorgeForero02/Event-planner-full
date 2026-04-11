import { useState, useEffect, useCallback } from 'react';
import {
    obtenerPerfil,
    obtenerEventoPorId,
    obtenerActividadesEvento,
    crearEvento,
    crearActividad,
    actualizarEvento,
    actualizarActividad,
    obtenerLugares,
} from './eventosService';
import { useNavigate } from 'react-router-dom';

export const useEvento = (idEvento = null) => {
    const navigate = useNavigate();

    const [empresa, setEmpresa] = useState(null);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        fecha_limite_cancelacion: '',
        modalidad: 'Presencial',
        cupos: '',
        estado: 0,
        hora: '',
        lugar_id: '',
        url_virtual: '',
    });

    const [lugaresEmpresa, setLugaresEmpresa] = useState([]);

    const [actividades, setActividades] = useState([
        { titulo: '', descripcion: '', fecha_actividad: '', hora_inicio: '', hora_fin: '', presupuesto: '' }
    ]);

    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [loading, setLoading] = useState(true);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [mostrarModalExito, setMostrarModalExito] = useState(false);
    const [mostrarModalError, setMostrarModalError] = useState(false);
    const [error, setError] = useState(null);
    const [errorCupos, setErrorCupos] = useState({ mostrar: false, mensaje: '', capacidadLugar: 0 });

    const handleVolver = () => navigate('/organizador');

    const handleCerrarModal = useCallback(() => {
        setMostrarModalExito(false);
        navigate("/organizador");
    }, [navigate]);

    const formatearHora = (h) => {
        if (!h) return "";
        return h.slice(0, 5);
    };

    const validarFormulario = () => {
        if (!formData.titulo.trim()) {
            setMensaje({ tipo: 'error', texto: 'El título es obligatorio' });
            return false;
        }

        if (!formData.fecha_inicio || !formData.fecha_fin) {
            setMensaje({ tipo: 'error', texto: 'Debes ingresar fechas válidas' });
            return false;
        }

        if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
            setMensaje({ tipo: 'error', texto: 'La fecha final no puede ser anterior' });
            return false;
        }

        if (Number(formData.estado) === 1) {
            if (!formData.fecha_limite_cancelacion) {
                setMensaje({ tipo: 'error', texto: 'La fecha límite de cancelación es obligatoria al publicar el evento' });
                return false;
            }
            if (formData.fecha_inicio && new Date(formData.fecha_limite_cancelacion) > new Date(formData.fecha_inicio)) {
                setMensaje({ tipo: 'error', texto: 'La fecha límite de cancelación debe ser anterior o igual a la fecha de inicio' });
                return false;
            }
        } else if (formData.fecha_limite_cancelacion && formData.fecha_inicio) {
            if (new Date(formData.fecha_limite_cancelacion) > new Date(formData.fecha_inicio)) {
                setMensaje({ tipo: 'error', texto: 'La fecha límite de cancelación debe ser anterior o igual a la fecha de inicio' });
                return false;
            }
        }

        if ((formData.modalidad === 'Presencial' || formData.modalidad === 'Híbrida') && !formData.lugar_id) {
            setMensaje({ tipo: 'error', texto: 'Debes seleccionar una sala para eventos presenciales o híbridos' });
            return false;
        }

        if ((formData.modalidad === 'Virtual' || formData.modalidad === 'Híbrida') && !formData.url_virtual.trim()) {
            setMensaje({ tipo: 'error', texto: 'Debes ingresar la URL de la reunión virtual' });
            return false;
        }

        return true;
    };

    const cargarEvento = useCallback(async (id) => {
        try {
            const eventoRes = await obtenerEventoPorId(id);
            const evento = eventoRes.data;

            const formatearFecha = (f) =>
                f ? new Date(f).toISOString().split("T")[0] : "";

            setFormData({
                titulo: evento.titulo ?? "",
                descripcion: evento.descripcion ?? "",
                fecha_inicio: formatearFecha(evento.fecha_inicio),
                fecha_fin: formatearFecha(evento.fecha_fin),
                fecha_limite_cancelacion: formatearFecha(evento.fecha_limite_cancelacion),
                modalidad: evento.modalidad ?? "Presencial",
                cupos: evento.cupos ?? "",
                estado: evento.estado ?? 0,
                hora: formatearHora(evento.hora),
                lugar_id: evento.lugar_id ?? '',
                url_virtual: evento.url_virtual ?? '',
            });

            const actsRes = await obtenerActividadesEvento(id);
            const acts = Array.isArray(actsRes.data)
                ? actsRes.data
                : [actsRes.data];

            setActividades(
                acts.length
                    ? acts.map((a) => ({
                        id: a.id,
                        titulo: a.titulo ?? "",
                        descripcion: a.descripcion ?? "",
                        fecha_actividad: a.fecha_actividad
                            ? new Date(a.fecha_actividad).toISOString().split("T")[0]
                            : "",
                        hora_inicio: a.hora_inicio ?? "",
                        hora_fin: a.hora_fin ?? "",
                        presupuesto: a.presupuesto ?? "",
                        esExistente: true,
                    }))
                    : [{
                        titulo: "",
                        descripcion: "",
                        fecha_actividad: "",
                        hora_inicio: "",
                        hora_fin: "",
                        presupuesto: "",
                        esExistente: false,
                    }]
            );
        } catch {
            setMensaje({ tipo: "error", texto: "No se pudo cargar el evento" });
        }
    }, []);

    const obtenerCapacidadLugar = (idLugar) => {
        const lugar = lugaresEmpresa.find(l => String(l.id) === String(idLugar));
        return lugar?.capacidad ?? null;
    };

    const validarCuposContraCapacidad = (idLugar, cupos) => {
        const capacidad = obtenerCapacidadLugar(idLugar);
        if (capacidad && parseInt(cupos) > capacidad) {
            setErrorCupos({
                mostrar: true,
                mensaje: `Los cupos (${cupos}) exceden la capacidad del lugar (${capacidad}).`,
                capacidadLugar: capacidad,
            });
            return false;
        }
        setErrorCupos({ mostrar: false, mensaje: '', capacidadLugar: 0 });
        return true;
    };

    const handleInputChange = (campo, valor) => {
        setFormData(prev => {
            const next = { ...prev, [campo]: valor };
            if (campo === 'lugar_id' || campo === 'cupos') {
                const idLugar = campo === 'lugar_id' ? valor : prev.lugar_id;
                const cupos   = campo === 'cupos'   ? valor : prev.cupos;
                if (idLugar && cupos && (next.modalidad === 'Presencial' || next.modalidad === 'Híbrida')) {
                    validarCuposContraCapacidad(idLugar, cupos);
                }
            }
            if (campo === 'modalidad' && valor === 'Virtual') {
                next.lugar_id = '';
            }
            if (campo === 'modalidad' && valor === 'Presencial') {
                next.url_virtual = '';
            }
            return next;
        });
    };

    const guardarEvento = async () => {
        if (!validarFormulario()) return;

        setGuardando(true);
        setEnviando(true);

        const dataAEnviar = {
            ...formData,
            hora: formatearHora(formData.hora),
            estado: Number(formData.estado),
            cupos: Number(formData.cupos)
        };

        const sanitized = {};
        Object.keys(dataAEnviar).forEach((k) => {
            const v = dataAEnviar[k];
            // Excluir null, undefined y strings vacíos (campos opcionales no completados)
            if (v !== null && v !== undefined && v !== '') sanitized[k] = v;
        });

        if (sanitized.cupos !== undefined) {
            const num = Number(sanitized.cupos);
            sanitized.cupos = Number.isNaN(num) ? sanitized.cupos : num;
        }

        try {
            const eventoGuardado = idEvento
                ? await actualizarEvento(idEvento, sanitized)
                : await crearEvento({ ...sanitized, id_empresa: empresa.id });

            const eventoId = idEvento || eventoGuardado?.data?.id;

            for (const act of actividades) {
                if (!act.titulo?.trim()) continue;
                act.id
                    ? await actualizarActividad(act.id, act)
                    : await crearActividad(eventoId, act);
            }

            setMostrarModalExito(true);
        } catch (err) {
            const backendMsg = err?.response?.data?.message || err?.message || null;
            const texto = backendMsg || 'Error al guardar el evento';
            setMensaje({ tipo: 'error', texto });
            setMostrarModalError(true);
        }
        finally {
            setGuardando(false);
            setEnviando(false);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        await guardarEvento();
    };

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                setCargando(true);

                const perfil = await obtenerPerfil();
                const empresaId = perfil.data?.usuario?.rolData?.id_empresa;
                const nombreEmpresa =
                    perfil.data?.usuario?.rolData?.empresa?.nombre || "Mi Empresa";

                if (!empresaId)
                    throw new Error("No se pudo obtener el ID de la empresa.");

                setEmpresa({ id: empresaId, nombre: nombreEmpresa });

                try {
                    const lugaresRes = await obtenerLugares(empresaId);
                    setLugaresEmpresa(Array.isArray(lugaresRes.data) ? lugaresRes.data : []);
                } catch {
                    setLugaresEmpresa([]);
                }

                if (idEvento) await cargarEvento(idEvento);
            } catch {
                setError("Error al cargar datos");
                setMensaje({ tipo: "error", texto: "Error al cargar datos" });
            } finally {
                setLoading(false);
                setCargando(false);
            }
        };

        cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idEvento]);
    useEffect(() => {
        if (mostrarModalExito) {
            const timer = setTimeout(() => {
                handleCerrarModal();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [mostrarModalExito, handleCerrarModal]);

    return {
        empresa,
        formData,
        setFormData,
        actividades,
        setActividades,
        lugaresEmpresa,
        mensaje,
        loading,
        cargando,
        guardando,
        enviando,
        error,
        errorCupos,
        setErrorCupos,
        obtenerCapacidadLugar,
        mostrarModalExito,
        mostrarModalError,
        setMostrarModalExito,
        setMostrarModalError,
        handleInputChange,
        guardarEvento,
        handleSubmit,
        handleVolver,
        handleCerrarModal
    };
};
