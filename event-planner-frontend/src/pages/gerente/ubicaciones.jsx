import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Pencil, X, Trash2, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import styles from './ubicaciones.module.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import Header from '../../layouts/Header/header';
import GerenteSidebar from '../../layouts/Sidebar/sidebarGerente/GerenteSidebar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const Notification = ({ type, title, message, onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} className={styles.notificationIcon} />;
            case 'error':
                return <XCircle size={20} className={styles.notificationIcon} />;
            case 'warning':
                return <AlertCircle size={20} className={styles.notificationIcon} />;
            case 'info':
                return <Info size={20} className={styles.notificationIcon} />;
            default:
                return <Info size={20} className={styles.notificationIcon} />;
        }
    };

    return (
        <div className={`${styles.notification} ${styles[type]}`}>
            {getIcon()}
            <div className={styles.notificationContent}>
                <div className={styles.notificationTitle}>{title}</div>
                <div className={styles.notificationMessage}>{message}</div>
            </div>
            <button className={styles.notificationClose} onClick={onClose}>
                <X size={16} />
            </button>
        </div>
    );
};

const Ubicaciones = () => {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [empresa, setEmpresa] = useState(null);
    const [ciudades, setCiudades] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [formData, setFormData] = useState({
        lugar: '',
        direccion: '',
        capacidad: '',
        descripcion: '',
        id_ciudad: ''
    });
    const [editingUbicacion, setEditingUbicacion] = useState(null);
    const [deletingUbicacion, setDeletingUbicacion] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (empresa && ciudades.length > 0 && ubicaciones.length > 0) {
            const ubicacionesActualizadas = ubicaciones.map(ubicacion => {
                if (ubicacion.id_ciudad && !ubicacion.ciudad_nombre) {
                    const ciudadEncontrada = ciudades.find(ciudad => ciudad.id === ubicacion.id_ciudad);
                    return {
                        ...ubicacion,
                        ciudad_nombre: ciudadEncontrada ? ciudadEncontrada.nombre : 'Sin ciudad'
                    };
                }
                return ubicacion;
            });
            setUbicaciones(ubicacionesActualizadas);
        }
    }, [ciudades, empresa, ubicaciones]);

    const showNotification = (type, title, message, duration = 5000) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            type,
            title,
            message,
            duration
        };

        setNotifications(prev => [...prev, newNotification]);
        return id;
    };

    const closeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const getToken = () => {
        const tokenNames = ['access_token', 'token', 'auth_token'];
        for (const name of tokenNames) {
            const token = localStorage.getItem(name);
            if (token) {
                return token;
            }
        }
        return null;
    };

    const fetchData = async () => {
        try {
            const token = getToken();
            if (!token) {
                return;
            }

            await Promise.all([
                fetchCiudades(token),
                fetchEmpresaUsuario(token)

            ]);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchEmpresaUsuario = async (token = null) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const profileResponse = await fetch(`${API_URL}/auth/profile`, {
                headers: headers
            });

            if (!profileResponse.ok) {
                throw new Error(`HTTP ${profileResponse.status}: ${profileResponse.statusText}`);
            }

            const profileResult = await profileResponse.json();

            if (profileResult.success) {
                let empresaId = null;

                if (profileResult.data?.usuario?.roData?.empresa?.id) {
                    empresaId = profileResult.data.usuario.roData.empresa.id;
                }
                else if (profileResult.data?.usuario?.roData?.id_empresa) {
                    empresaId = profileResult.data.usuario.roData.id_empresa;
                }
                else if (profileResult.data?.empresa?.id) {
                    empresaId = profileResult.data.empresa.id;
                }
                else if (profileResult.data?.id_empresa) {
                    empresaId = profileResult.data.id_empresa;
                }
                else if (profileResult.data?.usuario?.id_empresa) {
                    empresaId = profileResult.data.usuario.id_empresa;
                }

                if (empresaId) {
                    await fetchEmpresaDetalles(empresaId, token);
                } else {
                    await fetchPrimeraEmpresa(token);
                }
            } else {
                await fetchPrimeraEmpresa(token);
            }
        } catch (error) {
            await fetchPrimeraEmpresa(token);
        }
    };

    const fetchEmpresaDetalles = async (empresaId, token = null) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/empresas/${empresaId}`, {
                headers: headers
            });

            if (!response.ok) {
                if (response.status === 404) {
                    await fetchPrimeraEmpresa(token);
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                setEmpresa(result.data);
                await fetchUbicacionesByEmpresa(result.data.id, token);
            } else {
                await fetchPrimeraEmpresa(token);
            }
        } catch (error) {
            await fetchPrimeraEmpresa(token);
        }
    };

    const fetchPrimeraEmpresa = async (token = null) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/empresas`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
                const primeraEmpresa = result.data[0];
                setEmpresa(primeraEmpresa);
                await fetchUbicacionesByEmpresa(primeraEmpresa.id, token);
            } else {
                const empresaDefault = {
                    id: 1,
                    nombre: 'Mi Empresa'
                };
                setEmpresa(empresaDefault);
                setUbicaciones([]);
            }
        } catch (error) {
            const empresaDefault = {
                id: 1,
                nombre: 'Mi Empresa'
            };
            setEmpresa(empresaDefault);
            setUbicaciones([]);
        }
    };

    const fetchUbicacionesByEmpresa = async (empresaId, token = null, ciudadesList = ciudades) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/empresas/${empresaId}/ubicaciones`, {
                headers: headers
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setUbicaciones([]);
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                let ubicacionesArray = result.data;

                if (!Array.isArray(ubicacionesArray)) {

                    if (ubicacionesArray === null || ubicacionesArray === undefined) {
                        ubicacionesArray = [];
                    } else if (typeof ubicacionesArray === 'object') {
                        ubicacionesArray = [ubicacionesArray];
                    } else {
                        ubicacionesArray = [];
                    }
                }

                const ubicacionesConCiudades = ubicacionesArray.map(ubicacion => {

                    let ciudadNombre = 'Sin ciudad';

                    if (Array.isArray(ubicacion.ciudad) && ubicacion.ciudad.length > 0) {
                        ciudadNombre = ubicacion.ciudad[0].nombre;
                    } else if (ubicacion.ciudad && typeof ubicacion.ciudad === 'object' && ubicacion.ciudad.nombre) {
                        ciudadNombre = ubicacion.ciudad.nombre;
                    } else if (ubicacion.ciudad_nombre) {
                        ciudadNombre = ubicacion.ciudad_nombre;
                    } else if (ubicacion.nombre_ciudad) {
                        ciudadNombre = ubicacion.nombre_ciudad;
                    } else if (ubicacion.id_ciudad && Array.isArray(ciudades) && ciudades.length > 0) {
                        const ciudadEncontrada = ciudades.find(ciudad => ciudad.id === ubicacion.id_ciudad);
                        if (ciudadEncontrada) {
                            ciudadNombre = ciudadEncontrada.nombre;
                        }
                    }

                    return {
                        ...ubicacion,
                        ciudad_nombre: ciudadNombre
                    };
                });

                setUbicaciones(ubicacionesConCiudades);
            } else {
                setUbicaciones([]);
            }
        } catch (error) {
            setUbicaciones([]);
        }
    };

    const fetchCiudades = async (token = null) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/ciudades`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.data && Array.isArray(result.data)) {
                setCiudades(result.data);
            } else {
                setCiudades([]);
            }
        } catch (error) {
            setCiudades([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            if (!empresa || !empresa.id) {
                showNotification('error', 'Error', 'No se pudo determinar la empresa del usuario. Por favor, recargue la página.');
                return;
            }

            const response = await fetch(`${API_URL}/empresas/${empresa.id}/ubicaciones`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    lugar: formData.lugar,
                    direccion: formData.direccion,
                    capacidad: parseInt(formData.capacidad),
                    descripcion: formData.descripcion,
                    id_ciudad: parseInt(formData.id_ciudad)
                })
            });

            const result = await response.json();

            if (result.success) {
                showNotification('success', 'Éxito', 'Ubicación creada exitosamente');
                closeAllModals();
                await fetchUbicacionesByEmpresa(empresa.id, token);
            } else {
                showNotification('error', 'Error', `Error al crear ubicación: ${result.message || 'Error desconocido'}`);
            }
        } catch (error) {
            showNotification('error', 'Error', 'Error al crear ubicación. Por favor, intente nuevamente.');
        }
    };

    const handleEdit = (ubicacion) => {
        setEditingUbicacion(ubicacion);
        setFormData({
            lugar: ubicacion.lugar || '',
            direccion: ubicacion.direccion || '',
            capacidad: ubicacion.capacidad || '',
            descripcion: ubicacion.descripcion || '',
            id_ciudad: ubicacion.id_ciudad || ''
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            if (!editingUbicacion || !empresa) {
                showNotification('error', 'Error', 'No hay ubicación seleccionada para editar o no se encontró la empresa');
                return;
            }

            const response = await fetch(`${API_URL}/ubicaciones/${editingUbicacion.id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({
                    lugar: formData.lugar,
                    direccion: formData.direccion,
                    capacidad: parseInt(formData.capacidad),
                    descripcion: formData.descripcion,
                    id_ciudad: parseInt(formData.id_ciudad)
                })
            });

            const result = await response.json();

            if (result.success) {
                showNotification('success', 'Éxito', 'Ubicación actualizada exitosamente');
                closeAllModals();
                await Promise.all([
                    fetchCiudades(token),
                    fetchUbicacionesByEmpresa(empresa.id, token)
                ]);
            } else {
                showNotification('error', 'Error', `Error al actualizar ubicación: ${result.message || 'Error desconocido'}`);
            }
        } catch (error) {
            showNotification('error', 'Error', 'Error al actualizar ubicación. Por favor, intente nuevamente.');
        }
    };

    const handleDeleteClick = (ubicacion) => {
        setDeletingUbicacion(ubicacion);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingUbicacion || !empresa) return;

        try {
            const token = getToken();
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/ubicaciones/${deletingUbicacion.id}`, {
                method: 'DELETE',
                headers: headers
            });

            const result = await response.json();

            if (result.success) {
                showNotification('success', 'Éxito', 'Ubicación eliminada exitosamente');
                closeAllModals();
                await fetchUbicacionesByEmpresa(empresa.id, token);
            } else {
                showNotification('error', 'Error', `Error al eliminar ubicación: ${result.message || 'Error desconocido'}`);
            }
        } catch (error) {
            showNotification('error', 'Error', 'Error al eliminar ubicación. Por favor, intente nuevamente.');
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDeletingUbicacion(null);
    };

    const closeAllModals = () => {
        setShowModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setEditingUbicacion(null);
        setDeletingUbicacion(null);
        setFormData({
            lugar: '',
            direccion: '',
            capacidad: '',
            descripcion: '',
            id_ciudad: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSidebarToggle = (collapsed) => {
        setSidebarCollapsed(collapsed);
    };

    const filteredUbicaciones = ubicaciones.filter(ubicacion => {
        const matchesSearch = ubicacion.lugar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ubicacion.direccion?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className={styles.appContainer}>
            <Header />

            <div className={styles.notificationContainer}>
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        type={notification.type}
                        title={notification.title}
                        message={notification.message}
                        duration={notification.duration}
                        onClose={() => closeNotification(notification.id)}
                    />
                ))}
            </div>

            <div className={styles.mainLayout}>
                <GerenteSidebar onToggle={handleSidebarToggle} />
                <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
                    <div className={styles.ubicacionesContainer}>
                        <div className={styles.ubicacionesHeader}>
                            <div className={styles.headerInfo}>
                                <h1>Ubicaciones</h1>
                            </div>
                            <button
                                className={styles.btnCreate}
                                onClick={() => {
                                    if (!empresa) {
                                        showNotification('warning', 'Espera', 'Espere a que cargue la información de la empresa');
                                        return;
                                    }
                                    setShowModal(true);
                                }}
                                disabled={!empresa}
                            >
                                <Plus size={20} />
                                Crear Ubicación
                            </button>
                        </div>

                        <div className={styles.ubicacionesContent}>
                            <h2>Listado de Ubicaciones</h2>

                            <div className={styles.filtersRow}>
                                <div className={styles.searchBox}>
                                    <Search size={20} className={styles.searchIcon} />
                                    <Input
                                        type="text"
                                        placeholder="Buscar por nombre o dirección..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.tableContainer}>
                                <table className={styles.ubicacionesTable}>
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Dirección</th>
                                            <th>Capacidad</th>
                                            <th>Descripción</th>
                                            <th>Ciudad</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUbicaciones.length === 0 ? (
                                            <tr>
                                            </tr>
                                        ) : (
                                            filteredUbicaciones.map((ubicacion) => (
                                                <tr key={ubicacion.id}>
                                                    <td>{ubicacion.lugar}</td>
                                                    <td>{ubicacion.direccion}</td>
                                                    <td>{ubicacion.capacidad}</td>
                                                    <td>{ubicacion.descripcion}</td>
                                                    <td>{ubicacion.ciudad_nombre || 'Sin ciudad'}</td>
                                                    <td className={styles.actionsCell}>
                                                        <button
                                                            className={styles.btnIcon}
                                                            title="Editar"
                                                            onClick={() => handleEdit(ubicacion)}
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            className={`${styles.btnIcon} ${styles.btnDelete}`}
                                                            title="Eliminar"
                                                            onClick={() => handleDeleteClick(ubicacion)}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={showModal} onOpenChange={(open) => !open && closeAllModals()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Ubicación</DialogTitle>
                    </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Empresa</Label>
                                <div className="text-sm font-medium text-slate-700 py-1">
                                    {empresa?.nombre || 'Cargando...'}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lugar">Nombre *</Label>
                                <Input
                                    type="text"
                                    id="lugar"
                                    name="lugar"
                                    value={formData.lugar}
                                    onChange={handleInputChange}
                                    placeholder="Nombre de la ubicación"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="direccion">Dirección *</Label>
                                <Input
                                    type="text"
                                    id="direccion"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleInputChange}
                                    placeholder="Dirección completa"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="capacidad">Capacidad *</Label>
                                <Input
                                    type="number"
                                    id="capacidad"
                                    name="capacidad"
                                    value={formData.capacidad}
                                    onChange={handleInputChange}
                                    placeholder="Capacidad de personas"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="id_ciudad">Ciudad *</Label>
                                <Select
                                    id="id_ciudad"
                                    name="id_ciudad"
                                    value={formData.id_ciudad}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione una ciudad</option>
                                    {ciudades.map((ciudad) => (
                                        <option key={ciudad.id} value={ciudad.id}>
                                            {ciudad.nombre}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descripcion">Descripción *</Label>
                                <Textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    placeholder="Descripción de la ubicación"
                                    rows="4"
                                    required
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeAllModals}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    Crear Ubicación
                                </Button>
                            </DialogFooter>
                        </form>
                </DialogContent>
            </Dialog>

            <Dialog open={showEditModal && !!editingUbicacion} onOpenChange={(open) => !open && closeAllModals()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Ubicación</DialogTitle>
                    </DialogHeader>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Empresa</Label>
                                <div className="text-sm font-medium text-slate-700 py-1">
                                    {empresa?.nombre || 'Cargando...'}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_lugar">Lugar *</Label>
                                <Input
                                    type="text"
                                    id="edit_lugar"
                                    name="lugar"
                                    value={formData.lugar}
                                    onChange={handleInputChange}
                                    placeholder="Nombre del lugar"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_direccion">Dirección *</Label>
                                <Input
                                    type="text"
                                    id="edit_direccion"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleInputChange}
                                    placeholder="Dirección completa"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_capacidad">Capacidad *</Label>
                                <Input
                                    type="number"
                                    id="edit_capacidad"
                                    name="capacidad"
                                    value={formData.capacidad}
                                    onChange={handleInputChange}
                                    placeholder="Capacidad de personas"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_id_ciudad">Ciudad *</Label>
                                <Select
                                    id="edit_id_ciudad"
                                    name="id_ciudad"
                                    value={formData.id_ciudad}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione una ciudad</option>
                                    {ciudades.map((ciudad) => (
                                        <option key={ciudad.id} value={ciudad.id}>
                                            {ciudad.nombre}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_descripcion">Descripción *</Label>
                                <Textarea
                                    id="edit_descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    placeholder="Descripción de la ubicación"
                                    rows="4"
                                    required
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeAllModals}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    Actualizar Ubicación
                                </Button>
                            </DialogFooter>
                        </form>
                </DialogContent>
            </Dialog>

            <Dialog open={showDeleteModal && !!deletingUbicacion} onOpenChange={(open) => !open && closeAllModals()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Eliminación</DialogTitle>
                    </DialogHeader>

                        <div className={styles.confirmDeleteContent}>
                            <p>
                                ¿Está seguro de que desea eliminar la ubicación <strong>"{deletingUbicacion.lugar}"</strong>?
                            </p>
                            <p className={styles.warningText}>
                                Esta acción no se puede deshacer.
                            </p>

                            <DialogFooter>
                                <button
                                    type="button"
                                    className={styles.btnCancel}
                                    onClick={closeAllModals}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.btnSubmit} ${styles.btnDeleteConfirm}`}
                                    onClick={handleDeleteConfirm}
                                >
                                    Eliminar Ubicación
                                </button>
                            </DialogFooter>
                        </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Ubicaciones;