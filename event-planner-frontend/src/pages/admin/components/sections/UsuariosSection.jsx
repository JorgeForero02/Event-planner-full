import React, { useState, useEffect, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { useAuth } from '../../../../contexts/AuthContext';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const ROLES_DEFAULT = [
    { id: 2, nombre: 'Gerente', tipo: 'gerente' },
    { id: 3, nombre: 'Organizador', tipo: 'organizador' },
    { id: 4, nombre: 'Ponente', tipo: 'ponente' },
    { id: 5, nombre: 'Asistente', tipo: 'asistente' }
];

const UsuariosSection = () => {
    useAuth();

    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('todas');
    const [filterEstado, setFilterEstado] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const isFirstRenderFilters = useRef(true);
    const USERS_PER_PAGE = 10;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [empresas, setEmpresas] = useState([]);
    const [credencialesUsuario, setCredencialesUsuario] = useState(null);
    const [selectedUsuario, setSelectedUsuario] = useState(null);

    const [loadingEmpresas, setLoadingEmpresas] = useState(false);
    const [loadingView, setLoadingView] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    const [notification, setNotification] = useState(null);
    const [showPassword, setShowPassword] = useState({
        contraseña: false,
        confirmarContraseña: false
    });

    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        numeroDocumento: '',
        telefono: '',
        email: '',
        rol: '',
        empresa: '',
        especialidad: '',
        contraseña: '',
        confirmarContraseña: ''
    });

    useEffect(() => {
        fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (showCreateModal || showEditModal) {
            fetchEmpresas();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showCreateModal, showEditModal]);

    useEffect(() => {
        if (selectedUsuario && usuarios.length > 0) {
            const usuarioActualizado = usuarios.find(u => u.id === selectedUsuario.id);
            if (usuarioActualizado) {
                const estadoActualNormalizado = estaActivo(selectedUsuario);
                const estadoNuevoNormalizado = estaActivo(usuarioActualizado);

                if (estadoActualNormalizado !== estadoNuevoNormalizado) {
                    setSelectedUsuario(usuarioActualizado);
                }
            }
        }
    }, [usuarios, selectedUsuario]);

    useEffect(() => {
        if (isFirstRenderFilters.current) {
            isFirstRenderFilters.current = false;
            return;
        }
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchUsuarios();
        }, 400);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, filterBy, filterEstado]);

    const showNotification = (type, message, duration = 4000) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), duration);
    };

    const getToken = () => localStorage.getItem('access_token');

    const handleApiError = (error, defaultMessage = 'Error de conexión') => {
        showNotification('error', error.message || defaultMessage);
    };

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const params = new URLSearchParams();
            if (searchTerm.trim()) params.append('nombre', searchTerm.trim());
            if (filterBy !== 'todas') params.append('rol', filterBy);
            if (filterEstado) params.append('estado', filterEstado);
            const query = params.toString();
            const response = await fetch(`${API_URL}/gestion-usuarios${query ? `?${query}` : ''}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setUsuarios(result.data || []);
                    syncSelectedUsuario(result.data);
                } else {
                    setError(result.message || 'Error al cargar usuarios');
                }
            } else {
                setError('Error al cargar usuarios');
            }
        } catch (error) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmpresas = async () => {
        setLoadingEmpresas(true);
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/empresas?incluir_pendientes=true`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const empresasAprobadas = result.data.filter(e => e.estado === 1);
                    setEmpresas(empresasAprobadas);
                }
            }
        } catch (error) {
            handleApiError(error, 'Error al cargar empresas');
        } finally {
            setLoadingEmpresas(false);
        }
    };

    const syncSelectedUsuario = (usuariosData) => {
        if (selectedUsuario && usuariosData) {
            const usuarioActualizado = usuariosData.find(u => u.id === selectedUsuario.id);
            if (usuarioActualizado) {
                setSelectedUsuario(usuarioActualizado);
            }
        }
    };

    const obtenerNombreEmpresa = (usuario) => {
        if (usuario.rol_data?.empresa_nombre) {
            return usuario.rol_data.empresa_nombre;
        }
        if (usuario.empresa && usuario.empresa !== 'N/A') {
            return usuario.empresa;
        }
        return 'N/A';
    };

    const estaActivo = (usuario) => {
        return usuario.activo === 1;
    };

    const getRolBadgeClass = (rol) => {
        const base = 'inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize';
        switch (rol) {
            case 'gerente':     return `${base} bg-purple-100 text-purple-700`;
            case 'organizador': return `${base} bg-teal-100 text-teal-700`;
            case 'ponente':     return `${base} bg-pink-100 text-pink-700`;
            case 'asistente':   return `${base} bg-indigo-100 text-indigo-700`;
            case 'administrador': return `${base} bg-amber-100 text-amber-700`;
            default:            return `${base} bg-slate-100 text-slate-600`;
        }
    };

    const getFilteredUsers = () => usuarios;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            apellidos: '',
            numeroDocumento: '',
            telefono: '',
            email: '',
            rol: '',
            empresa: '',
            especialidad: '',
            contraseña: '',
            confirmarContraseña: ''
        });
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleViewUser = async (usuario) => {
        setLoadingView(true);
        try {
            const token = getToken();
            if (!token) {
                showNotification('error', 'No hay sesión activa');
                return;
            }

            const response = await fetch(`${API_URL}/gestion-usuarios/${usuario.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                showNotification('error', 'Sesión expirada');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar información del usuario');
            }

            const result = await response.json();
            if (result.success && result.data) {
                setSelectedUsuario(result.data);
                setShowViewModal(true);
            } else {
                showNotification('error', 'No se pudo cargar la información del usuario');
            }
        } catch (error) {
            handleApiError(error, 'Error al cargar información del usuario');
        } finally {
            setLoadingView(false);
        }
    };

    const handleEditUser = async (usuario) => {
        setLoadingEdit(true);
        try {
            const token = getToken();
            if (!token) {
                showNotification('error', 'No hay sesión activa');
                return;
            }

            const response = await fetch(`${API_URL}/gestion-usuarios/${usuario.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar información del usuario');
            }

            const result = await response.json();
            if (result.success && result.data) {
                const userData = result.data;

                if (!userData.rol) {
                    showNotification('warning', 'Este usuario no tiene un rol asignado. Contacta al administrador.');
                    return;
                }

                const nombreCompleto = userData.nombre || '';
                const partesNombre = nombreCompleto.trim().split(' ');

                setFormData({
                    nombre: partesNombre[0] || '',
                    apellidos: partesNombre.slice(1).join(' ') || '',
                    numeroDocumento: userData.cedula || '',
                    telefono: userData.telefono || '',
                    email: userData.correo || '',
                    rol: userData.rol || '',
                    empresa: userData.rol_data?.empresa_id?.toString() || '',
                    especialidad: userData.rol_data?.especialidad || ''
                });

                setSelectedUsuario(userData);
                setShowEditModal(true);
            } else {
                showNotification('error', 'Error al cargar información del usuario');
            }
        } catch (error) {
            handleApiError(error, 'Error al cargar información del usuario');
        } finally {
            setLoadingEdit(false);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!validarFormularioEdicion()) return;
        setLoadingUpdate(true);

        try {
            const token = getToken();
            if (!token) {
                showNotification('error', 'No hay sesión activa');
                return;
            }

            const updateData = {
                nombre: `${formData.nombre} ${formData.apellidos}`.trim(),
                telefono: formData.telefono,
                correo: formData.email
            };

            const responseProfile = await fetch(`${API_URL}/gestion-usuarios/${selectedUsuario.id}/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!responseProfile.ok) {
                const errorData = await responseProfile.json();
                throw new Error(errorData.message || 'Error al actualizar perfil del usuario');
            }

            const roleData = {};

            if ((formData.rol === 'gerente' || formData.rol === 'organizador') && formData.empresa) {
                roleData.empresa_id = parseInt(formData.empresa);
            }

            if (formData.rol === 'ponente' && formData.especialidad) {
                roleData.especialidad = formData.especialidad;
            }

            if (Object.keys(roleData).length > 0 || formData.rol !== selectedUsuario.rol) {
                const responseRole = await fetch(`${API_URL}/gestion-usuarios/${selectedUsuario.id}/role-data`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        rol: formData.rol,
                        roleData: roleData
                    })
                });

                if (!responseRole.ok) {
                    const errorData = await responseRole.json();
                    if (errorData.message?.includes('no encontrado') || responseRole.status === 404) {
                        throw new Error(`El usuario no tiene un registro de rol ${formData.rol}. Es posible que necesites contactar al administrador.`);
                    }
                    throw new Error(errorData.message || 'Error al actualizar rol del usuario');
                }
            }

            showNotification('success', 'Usuario actualizado exitosamente');

            updateUsuarioEnLista(selectedUsuario.id, {
                nombre: `${formData.nombre} ${formData.apellidos}`.trim(),
                telefono: formData.telefono,
                correo: formData.email,
                rol: formData.rol,
                rol_data: {
                    empresa_id: formData.empresa ? parseInt(formData.empresa) : null,
                    empresa_nombre: empresas.find(e => e.id === parseInt(formData.empresa))?.nombre || null,
                    especialidad: formData.especialidad || null
                }
            });

            setShowEditModal(false);
            resetForm();
            setTimeout(fetchUsuarios, 1000);

        } catch (error) {
            handleApiError(error, 'Error al actualizar usuario');
        } finally {
            setLoadingUpdate(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            if (!token) {
                showNotification('error', 'No hay sesión activa');
                return;
            }

            if (!validarFormularioCreacion()) return;

            const requestBody = construirRequestBodyCreacion();
            const response = await fetch(`${API_URL}/auth/crear-usuario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            if (response.ok && result.success) {
                manejarCreacionExitosa(result);
            } else {
                showNotification('error', result.message || 'Error al crear usuario');
            }
        } catch (error) {
            handleApiError(error, 'Error de conexión con el servidor');
        }
    };

    const handleToggleStatus = async (id, nombre, estadoActual) => {
        const estadoActualNormalizado = Number(estadoActual);
        const nuevoEstado = estadoActualNormalizado === 1 ? 0 : 1;

        const accion = nuevoEstado === 1 ? 'activar' : 'desactivar';
        const mensaje = nuevoEstado === 1
            ? `¿Estás seguro de activar al usuario ${nombre}?`
            : `¿Estás seguro de desactivar al usuario ${nombre}?`;

        if (mensaje) {
            setLoadingStatus(true);
            try {
                const token = getToken();
                if (!token) {
                    showNotification('error', 'No hay sesión activa');
                    return;
                }

                const response = await fetch(`${API_URL}/gestion-usuarios/${id}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ activo: nuevoEstado })
                });

                if (response.status === 401) {
                    showNotification('error', 'Sesión expirada');
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error al ${accion} usuario`);
                }

                const result = await response.json();
                if (result.success) {
                    const estadoFinal = result.data.activo;
                    showNotification('success', result.message, 5000);
                    actualizarEstadoUsuario(id, estadoFinal);
                } else {
                    showNotification('error', result.message || `Error al ${accion} usuario`);
                }
            } catch (error) {
                handleApiError(error, `Error al ${accion} usuario`);
            } finally {
                setLoadingStatus(false);
            }
        }
    };

    const validarFormularioCreacion = () => {
        if (formData.contraseña !== formData.confirmarContraseña) {
            showNotification('error', 'Las contraseñas no coinciden');
            return false;
        }

        if (formData.contraseña.length < 6) {
            showNotification('error', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        if (!formData.nombre || !formData.apellidos || !formData.numeroDocumento ||
            !formData.telefono || !formData.email || !formData.rol) {
            showNotification('error', 'Por favor completa todos los campos obligatorios');
            return false;
        }

        if ((formData.rol === 'gerente' || formData.rol === 'organizador') && !formData.empresa) {
            showNotification('error', 'Para los roles de Gerente u Organizador se requiere seleccionar una empresa');
            return false;
        }

        return true;
    };

    const validarFormularioEdicion = () => {
        if (!formData.nombre || !formData.apellidos || !formData.telefono || !formData.email || !formData.rol) {
            showNotification('error', 'Por favor completa todos los campos obligatorios');
            return false;
        }

        if ((formData.rol === 'gerente' || formData.rol === 'organizador') && !formData.empresa) {
            showNotification('error', 'Para los roles de Gerente u Organizador se requiere seleccionar una empresa');
            return false;
        }

        return true;
    };

    const construirRequestBodyCreacion = () => {
        const requestBody = {
            nombre: `${formData.nombre} ${formData.apellidos}`.trim(),
            cedula: formData.numeroDocumento,
            correo: formData.email,
            telefono: formData.telefono,
            rol: formData.rol,
            contraseña: formData.contraseña
        };

        if (formData.empresa && !isNaN(parseInt(formData.empresa))) {
            requestBody.id_empresa = parseInt(formData.empresa);
        }

        if (formData.rol === 'ponente' && formData.especialidad) {
            requestBody.especialidad = formData.especialidad;
        }

        return requestBody;
    };

    const manejarCreacionExitosa = (result) => {
        setCredencialesUsuario({
            nombre: result.data.nombre,
            correo: result.data.correo,
            rol: result.data.rol,
            empresa: result.data.empresa?.nombre || 'N/A',
            mensaje: result.message
        });

        setShowCreateModal(false);
        setShowPasswordModal(true);
        resetForm();
        fetchUsuarios();
    };

    const updateUsuarioEnLista = (id, datos) => {
        setUsuarios(prevUsuarios =>
            prevUsuarios.map(usuario =>
                usuario.id === id ? { ...usuario, ...datos } : usuario
            )
        );
    };

    const actualizarEstadoUsuario = (id, nuevoEstado) => {
        setUsuarios(prevUsuarios =>
            prevUsuarios.map(usuario =>
                usuario.id === id ? { ...usuario, activo: nuevoEstado } : usuario
            )
        );

        if (selectedUsuario && selectedUsuario.id === id) {
            setSelectedUsuario(prev => ({
                ...prev,
                activo: nuevoEstado
            }));
        }
    };

    const rolesDelSistema = (() => {
        try {
            const savedRoles = localStorage.getItem('rolesState');
            const roles = savedRoles ? JSON.parse(savedRoles) : [
                { id: 1, nombre: 'Administrador', tipo: 'administrador', activo: true, editable: false },
                ...ROLES_DEFAULT
            ];

            return roles
                .filter(rol => rol.activo !== false && rol.tipo !== 'administrador')
                .map(rol => ({
                    id: rol.id,
                    nombre: rol.nombre,
                    tipo: rol.tipo
                }));
        } catch (error) {
            return ROLES_DEFAULT;
        }
    })();

    const filteredUsers = getFilteredUsers();
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const renderTableRows = () => {
        if (filteredUsers.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan="7" className="text-center py-6 text-slate-500">
                        No se encontraron usuarios
                    </TableCell>
                </TableRow>
            );
        }

        return paginatedUsers.map((usuario) => (
            <TableRow key={usuario.id}>
                <TableCell>
                    <div className="font-medium text-slate-900">
                        <span>{usuario.nombre || 'N/A'}</span>
                    </div>
                </TableCell>
                <TableCell>{usuario.cedula || 'N/A'}</TableCell>
                <TableCell>{usuario.email || usuario.correo || 'N/A'}</TableCell>
                <TableCell>{usuario.telefono || 'N/A'}</TableCell>
                <TableCell>{obtenerNombreEmpresa(usuario)}</TableCell>
                <TableCell>
                    <div className="flex items-center justify-between gap-3">
                        <span className={getRolBadgeClass(usuario.rol)}>
                            {usuario.rol || 'N/A'}
                        </span>
                        <div className="flex gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
                            <button
                                className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                                title="Ver"
                                onClick={() => handleViewUser(usuario)}
                                disabled={loadingView || loadingEdit}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 3C4.5 3 1.7 5.6 1 8c.7 2.4 3.5 5 7 5s6.3-2.6 7-5c-.7-2.4-3.5-5-7-5zm0 8a3 3 0 110-6 3 3 0 010 6z" />
                                </svg>
                            </button>
                            <button
                                className="p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                                title="Editar"
                                onClick={() => handleEditUser(usuario)}
                                disabled={loadingView || loadingEdit}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9zm1.4-.4a1 1 0 011.4 0l1.6 1.6a1 1 0 010 1.4l-1.1 1-3-3 1.1-1z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </TableCell>
            </TableRow>
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64 p-12">
                <div className="text-slate-500 text-base">Cargando usuarios...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-64 p-12">
                <div className="text-center">
                    <p className="text-danger font-medium mb-3">Error: {error}</p>
                    <button onClick={fetchUsuarios} className="px-4 py-2 bg-brand-600 hover:bg-brand-600/90 text-white rounded-lg text-sm font-medium transition-colors">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {notification && (
                <div className={`fixed top-5 right-5 z-[2000] min-w-[320px] max-w-md bg-white rounded-xl shadow-xl overflow-hidden animate-slide-up ${
                    notification.type === 'success' ? 'border-l-4 border-success' :
                    notification.type === 'warning' ? 'border-l-4 border-warning' :
                    'border-l-4 border-danger'
                }`}>
                    <div className="flex items-start gap-3 p-4">
                        <div className={`shrink-0 mt-0.5 ${
                            notification.type === 'success' ? 'text-success' :
                            notification.type === 'warning' ? 'text-warning' : 'text-danger'
                        }`}>
                            {notification.type === 'success' ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <p className="flex-1 text-sm text-slate-700">{notification.message}</p>
                        <button
                            className="shrink-0 text-slate-400 hover:text-slate-600 text-xl leading-none p-0 ml-1"
                            onClick={() => setNotification(null)}
                        >
                            ×
                        </button>
                    </div>
                    <div className={`h-1 w-full ${
                        notification.type === 'success' ? 'bg-success' :
                        notification.type === 'warning' ? 'bg-warning' : 'bg-danger'
                    }`}></div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-600/90 text-white rounded-lg text-sm font-medium transition-colors"
                    onClick={() => setShowCreateModal(true)}
                >
                    + Crear Usuarios
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-200">
                    <h2 className="text-base font-semibold text-slate-800">Listado de Usuarios</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white transition-colors"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <div className="flex items-center gap-2 relative">
                            <label htmlFor="filter-select" className="text-sm text-slate-500 whitespace-nowrap">Filtrar por:</label>
                            <select
                                id="filter-select"
                                className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-w-[140px] cursor-pointer"
                                value={filterBy}
                                onChange={(e) => { setFilterBy(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="todas">Mostrar todas</option>
                                <option value="gerente">Gerente</option>
                                <option value="ponente">Ponente</option>
                                <option value="organizador">Organizador</option>
                                <option value="asistente">Asistente</option>
                            </select>
                            <svg className="absolute right-2 pointer-events-none text-slate-400" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="flex items-center gap-2 relative">
                            <label htmlFor="estado-select" className="text-sm text-slate-500 whitespace-nowrap">Estado:</label>
                            <select
                                id="estado-select"
                                className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-w-[130px] cursor-pointer"
                                value={filterEstado}
                                onChange={(e) => { setFilterEstado(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="">Todos</option>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                            <svg className="absolute right-2 pointer-events-none text-slate-400" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Cédula</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Telefono</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Rol</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {renderTableRows()}
                        </TableBody>
                    </Table>

                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-sm text-slate-600">
                            <div className="flex items-center gap-3">
                                <span>
                                    {filteredUsers.length === 0
                                        ? 'Sin resultados'
                                        : `Mostrando ${Math.min((currentPage - 1) * USERS_PER_PAGE + 1, filteredUsers.length)}–${Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} de ${filteredUsers.length} usuarios`
                                    }
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    ‹ Anterior
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .reduce((acc, p, idx, arr) => {
                                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((item, idx) =>
                                        item === '...' ? (
                                            <span key={`ellipsis-${idx}`} className="px-1">…</span>
                                        ) : (
                                            <button
                                                key={item}
                                                onClick={() => handlePageChange(item)}
                                                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                                                    item === currentPage
                                                        ? 'bg-brand-600 text-white'
                                                        : 'hover:bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                {item}
                                            </button>
                                        )
                                    )
                                }
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Siguiente ›
                                </button>
                            </div>
                        </div>
                </div>
            </div>

            {showViewModal && selectedUsuario && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowViewModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold text-slate-800">Ver Usuario</h2>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setShowViewModal(false)}>×</button>
                        </div>

                        <div className="overflow-y-auto p-6 flex flex-col gap-5">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                estaActivo(selectedUsuario)
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-red-50 text-danger border border-red-200'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                    estaActivo(selectedUsuario) ? 'bg-success' : 'bg-danger'
                                }`} />
                                <span>
                                    Estado: {estaActivo(selectedUsuario) ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            <div className="mb-2">
                                <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">Información Personal</h4>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
                                        <input
                                            type="text"
                                            value={selectedUsuario.nombre || 'N/A'}
                                            disabled
                                            readOnly
                                            className="w-full h-9 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-600 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Número de Documento</label>
                                        <input
                                            type="text"
                                            value={selectedUsuario.cedula || 'N/A'}
                                            disabled
                                            readOnly
                                            className="w-full h-9 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-600 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Teléfono</label>
                                        <input
                                            type="text"
                                            value={selectedUsuario.telefono || 'N/A'}
                                            disabled
                                            readOnly
                                            className="w-full h-9 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-600 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        value={selectedUsuario.correo || 'N/A'}
                                        disabled
                                        readOnly
                                        className="w-full h-9 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-600 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="mb-2">
                                <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">Información del Sistema</h4>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Rol Asignado</label>
                                    <input
                                        type="text"
                                        value={selectedUsuario.rol ? selectedUsuario.rol.charAt(0).toUpperCase() + selectedUsuario.rol.slice(1) : 'N/A'}
                                        disabled
                                        readOnly
                                        className="w-full h-9 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-600 cursor-not-allowed capitalize"
                                    />
                                </div>

                                {selectedUsuario.rol_data?.empresa_nombre && (
                                    <div className="space-y-2">
                                        <label>Empresa Asociada</label>
                                        <input
                                            type="text"
                                            value={selectedUsuario.rol_data.empresa_nombre}
                                            disabled
                                            readOnly
                                        />
                                    </div>
                                )}

                                {selectedUsuario.rol_data?.especialidad && (
                                    <div className="space-y-2">
                                        <label>Especialidad</label>
                                        <input
                                            type="text"
                                            value={selectedUsuario.rol_data.especialidad}
                                            disabled
                                            readOnly
                                        />
                                    </div>
                                )}
                            </div>

                            {selectedUsuario.fecha_creacion && (
                                <div className="mb-2">
                                    <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">Información Adicional</h4>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Fecha de Creación</label>
                                            <input
                                                type="text"
                                                value={new Date(selectedUsuario.fecha_creacion).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                                disabled
                                                readOnly
                                                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-600 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2">
                                <button
                                    onClick={() => handleToggleStatus(selectedUsuario.id, selectedUsuario.nombre, selectedUsuario.activo)}
                                    disabled={loadingStatus}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                                        estaActivo(selectedUsuario)
                                            ? 'bg-danger hover:bg-danger/90 text-white'
                                            : 'bg-success hover:bg-success/90 text-white'
                                    }`}
                                >
                                    {estaActivo(selectedUsuario) ? (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M6 2V1h4v1h4v2h-1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4H2V2h4zm1 3v7h2V5H7zm-2 0v7h2V5H5zm6 0v7h-2V5h2z" />
                                            </svg>
                                            {loadingStatus ? 'Desactivando...' : 'Desactivar Usuario'}
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M13.5 2L6 9.5 2.5 6 1 7.5l5 5 9-9z" />
                                            </svg>
                                            {loadingStatus ? 'Activando...' : 'Activar Usuario'}
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => setShowViewModal(false)}
                                    disabled={loadingStatus}
                                    className="px-4 py-2 bg-brand-600 hover:bg-brand-600/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && selectedUsuario && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                    setSelectedUsuario(null);
                }}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Editar Usuario</h3>
                            <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => {
                                setShowEditModal(false);
                                resetForm();
                                setSelectedUsuario(null);
                            }}>×</button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="overflow-y-auto p-6 flex flex-col gap-5">
                            <div className="mb-2">
                                <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">Información Personal</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Nombre *</label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            placeholder="Nombres completos"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Apellidos *</label>
                                        <input
                                            type="text"
                                            name="apellidos"
                                            placeholder="Apellidos completos"
                                            value={formData.apellidos}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <label className="text-sm font-medium text-slate-700">Número de Documento</label>
                                    <input
                                        type="text"
                                        name="numeroDocumento"
                                        value={formData.numeroDocumento}
                                        disabled
                                        className="w-full h-9 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-600 cursor-not-allowed"
                                    />
                                    <small className="text-xs text-slate-500 italic">El documento no puede ser modificado</small>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Teléfono *</label>
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Correo Electrónico *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-2">
                                <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">Información del Rol</h4>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Rol Asignado *</label>
                                    <select
                                        name="rol"
                                        value={formData.rol}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                                    >
                                        <option value="">Seleccionar rol...</option>
                                        {rolesDelSistema.map(r => (
                                            <option key={r.id} value={r.tipo}>
                                                {r.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {formData.rol === 'ponente' && (
                                    <div className="space-y-2 mt-4">
                                        <label className="text-sm font-medium text-slate-700">Especialidad</label>
                                        <input
                                            type="text"
                                            name="especialidad"
                                            placeholder="Ej: Tecnología, Negocios, Medicina..."
                                            value={formData.especialidad}
                                            onChange={handleInputChange}
                                            className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                                        />
                                        <small className="text-xs text-slate-500 italic">Especialidad del ponente</small>
                                    </div>
                                )}

                                {(formData.rol === 'gerente' || formData.rol === 'organizador') && (
                                    <div className="space-y-2 mt-4">
                                        <label className="text-sm font-medium text-slate-700">Empresa Asociada *</label>
                                        <select
                                            name="empresa"
                                            value={formData.empresa}
                                            onChange={handleInputChange}
                                            disabled={loadingEmpresas}
                                            required
                                            className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 transition disabled:bg-slate-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Seleccione una empresa...</option>
                                            {loadingEmpresas ? (
                                                <option disabled>Cargando empresas...</option>
                                            ) : (
                                                empresas.map(empresa => (
                                                    <option key={empresa.id} value={empresa.id}>
                                                        {empresa.nombre}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        <small className="text-xs text-slate-500 italic">Empresa asignada al usuario</small>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 font-medium transition-colors"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        resetForm();
                                        setSelectedUsuario(null);
                                    }}
                                    disabled={loadingUpdate}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                    disabled={loadingUpdate}
                                >
                                    {loadingUpdate ? (
                                        <>
                                            <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10" />
                                            </svg>
                                            Guardando...
                                        </>
                                    ) : (
                                        'Guardar Cambios'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Crear Nuevo Usuario</h3>
                            <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleCreateUser} className="overflow-y-auto p-6 flex flex-col gap-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Nombre *</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        placeholder="Nombres completos"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Apellidos *</label>
                                    <input
                                        type="text"
                                        name="apellidos"
                                        placeholder="Apellidos completos"
                                        value={formData.apellidos}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Número de Documento *</label>
                                <input
                                    type="text"
                                    name="numeroDocumento"
                                    placeholder="Número de identificación"
                                    value={formData.numeroDocumento}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                                />
                                <small className="text-xs text-slate-500 italic">
                                    Este documento debe ser único en el sistema
                                </small>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Teléfono *</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Correo Electrónico *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="usuario@ejemplo.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Rol Asignado *</label>
                                <select
                                    name="rol"
                                    value={formData.rol}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                                >
                                    <option value="">Seleccionar rol...</option>
                                    {rolesDelSistema.map(rol => (
                                        <option key={rol.id} value={rol.tipo}>
                                            {rol.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {formData.rol === 'ponente' && (
                                <div className="space-y-2">
                                    <label>Especialidad</label>
                                    <input
                                        type="text"
                                        name="especialidad"
                                        placeholder="Ej: Tecnología, Negocios..."
                                        value={formData.especialidad}
                                        onChange={handleInputChange}
                                    />
                                    <label>Empresa (Opcional)</label>
                                    <select
                                        name="empresa"
                                        value={formData.empresa}
                                        onChange={handleInputChange}
                                        disabled={loadingEmpresas}
                                    >
                                        <option value="">Sin empresa asignada</option>
                                    </select>
                                </div>

                            )}

                            {(formData.rol === 'gerente' || formData.rol === 'organizador') && (
                                <div className="space-y-2">
                                    <label>Empresa *</label>
                                    <select
                                        name="empresa"
                                        value={formData.empresa}
                                        onChange={handleInputChange}
                                        disabled={loadingEmpresas}
                                        required
                                    >
                                        <option value="">Seleccione una empresa...</option>
                                        {loadingEmpresas ? (
                                            <option disabled>Cargando empresas...</option>
                                        ) : (
                                            empresas.map(empresa => (
                                                <option key={empresa.id} value={empresa.id}>
                                                    {empresa.nombre}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Contraseña *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.contraseña ? "text" : "password"}
                                            name="contraseña"
                                            placeholder="Ingrese contraseña temporal"
                                            value={formData.contraseña}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full h-10 px-3 pr-10 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                            onClick={() => togglePasswordVisibility('contraseña')}
                                        >
                                            {showPassword.contraseña ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <small className="text-xs text-slate-500 italic">
                                        Contraseña temporal para el usuario
                                    </small>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Confirmar Contraseña *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirmarContraseña ? "text" : "password"}
                                            name="confirmarContraseña"
                                            placeholder="Confirme la contraseña"
                                            value={formData.confirmarContraseña}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full h-10 px-3 pr-10 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                            onClick={() => togglePasswordVisibility('confirmarContraseña')}
                                        >
                                            {showPassword.confirmarContraseña ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 font-medium transition-colors"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-600/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                                    Crear Usuario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPasswordModal && credencialesUsuario && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Usuario Creado Exitosamente</h3>
                            <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setShowPasswordModal(false)}>×</button>
                        </div>

                        <div className="overflow-y-auto p-6 flex flex-col gap-4">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
                                <p className="text-emerald-800 font-medium pb-2 border-b border-emerald-200/50">
                                    {credencialesUsuario.mensaje}
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 mt-4">
                                <h4 className="text-sm font-semibold text-blue-900 mb-3">Información del Usuario:</h4>

                                <div className="grid gap-2 text-sm">
                                    <div className="flex flex-col sm:flex-row sm:gap-2">
                                        <span className="text-slate-500 w-20">Nombre:</span>
                                        <span className="font-medium text-slate-900 break-all">{credencialesUsuario.nombre}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:gap-2">
                                        <span className="text-slate-500 w-20">Correo:</span>
                                        <span className="font-medium text-slate-900 break-all">{credencialesUsuario.correo}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:gap-2">
                                        <span className="text-slate-500 w-20">Rol:</span>
                                        <span className="font-medium text-slate-900 break-all capitalize">
                                            {credencialesUsuario.rol}
                                        </span>
                                    </div>
                                    {credencialesUsuario.empresa !== 'N/A' && (
                                        <div className="flex flex-col sm:flex-row sm:gap-2">
                                            <span className="text-slate-500 w-20">Empresa:</span>
                                            <span className="font-medium text-slate-900 break-all">{credencialesUsuario.empresa}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                                <div className="flex flex-col gap-1">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z" fill="#f57c00" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold text-amber-900 text-sm flex items-center gap-2">
                                            Contraseña Temporal Generada
                                        </p>
                                        <p className="text-amber-800 text-sm">
                                            Se ha generado una contraseña temporal y se ha enviado al correo electrónico del usuario.
                                            El usuario deberá cambiar esta contraseña en su primer inicio de sesión.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setCredencialesUsuario(null);
                                }}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsuariosSection;