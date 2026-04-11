import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Info, RefreshCw, ArrowLeft } from 'lucide-react';
import GerenteSidebar from '../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import empresaService from '../../components/empresaService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import Header from '../../layouts/Header/header';

const ActualizarEmpresa = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [cancelModalMessage, setCancelModalMessage] = useState('');
    const [empresaOriginal, setEmpresaOriginal] = useState(null);
    const [formData, setFormData] = useState({
        nombreEmpresa: '',
        nit: '',
        direccion: '',
        ciudad: '',
        pais: '',
        telefono: '',
        correo: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleSidebarToggle = (isCollapsed) => {
        setSidebarCollapsed(isCollapsed);
    };

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }

        cargarEmpresa();
    }, [navigate]);

    const cargarEmpresa = async () => {
        try {
            setIsLoading(true);
            setLoadError(null);

            const respuesta = await empresaService.obtenerEmpresaGerente();

            const empresaData = respuesta?.data?.[0];
            if (!empresaData) throw new Error('No se encontraron datos de la empresa.');

            if (empresaData.id_ciudad) {
                const ciudad = await empresaService.obtenerCiudadPorId(empresaData.id_ciudad);

                const ciudadData = ciudad?.data;
                const ciudadNombre = ciudadData?.nombre || ciudadData?.nombre_ciudad || '';

                const idPais = ciudadData?.id_pais;
                let paisNombre = '';

                if (idPais) {
                    const pais = await empresaService.obtenerPaisPorId(idPais);

                    const paisData = pais?.data;
                    paisNombre = paisData?.nombre || paisData?.nombre_pais || '';
                }

                setEmpresaOriginal({ ...empresaData, ciudad: ciudadNombre, pais: paisNombre, nombreEmpresa: empresaData.nombre });

                setFormData({
                    nombreEmpresa: empresaData.nombre || '',
                    nit: empresaData.nit || '',
                    direccion: empresaData.direccion || '',
                    ciudad: ciudadNombre || '',
                    pais: paisNombre || '',
                    telefono: empresaData.telefono || '',
                    correo: empresaData.correo || ''
                });
            }

        } catch (error) {
            setLoadError(error.message || 'No se pudieron cargar los datos de la empresa.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombreEmpresa.trim()) {
            newErrors.nombreEmpresa = 'El nombre de la empresa es requerido';
        }

        if (!formData.nit.trim()) {
            newErrors.nit = 'El NIT es requerido';
        }

        if (!formData.direccion.trim()) {
            newErrors.direccion = 'La dirección es requerida';
        }

        if (!formData.ciudad.trim()) {
            newErrors.ciudad = 'La ciudad es requerida';
        }

        if (!formData.pais.trim()) {
            newErrors.pais = 'El país es requerido';
        }

        if (!formData.telefono.trim()) {
            newErrors.telefono = 'El teléfono es requerido';
        }

        if (!formData.correo.trim()) {
            newErrors.correo = 'El correo electrónico es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
            newErrors.correo = 'El correo electrónico no es válido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const hasCambiado = (campo) => {
        if (!empresaOriginal) return false;
        return formData[campo] !== empresaOriginal[campo];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {

            const ciudadResponse = await empresaService.obtenerTodasCiudades();
            const ciudadEncontrada = ciudadResponse.data.find(
                (c) => c.nombre.toLowerCase() === formData.ciudad.toLowerCase()
            );

            if (!ciudadEncontrada) {
                throw new Error("La ciudad seleccionada no existe en la base de datos.");
            }

            const datosActualizados = {
                nombre: formData.nombreEmpresa,
                nit: formData.nit,
                direccion: formData.direccion,
                id_ciudad: ciudadEncontrada.id,
                telefono: formData.telefono,
                correo: formData.correo
            };

            await empresaService.actualizarEmpresa(empresaOriginal.id, datosActualizados);

            setModalMessage("Solicitud de actualización fue registrada correctamente. Será revisada por el equipo de administración.");
            setShowModal(true);

        } catch (error) {
            setModalMessage("Ocurrió un error al actualizar la empresa");
            setShowModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalMessage('');
        navigate('/gerente');
    };

    const handleCancel = () => {
        const hayCambios = Object.keys(formData).some(key => hasCambiado(key));

        if (hayCambios) {
            setCancelModalMessage("¿Está seguro que desea cancelar? Se perderán los cambios no guardados.");
            setShowCancelModal(true);
        } else {
            navigate('/gerente');
        }
    };

    const handleCloseCancelModal = () => {
        setShowCancelModal(false);
        setCancelModalMessage('');
        navigate('/gerente');
    };

    const handleCancelModalClose = () => {
        setShowCancelModal(false);
        setCancelModalMessage('');
    };

    const contentStyle = {
        marginLeft: sidebarCollapsed ? '80px' : '288px',
        width: sidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 288px)',
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="flex min-h-[calc(100vh-80px)]">
                    <GerenteSidebar onToggle={handleSidebarToggle} />
                    <div className="flex-1 flex items-center justify-center transition-all duration-300" style={contentStyle}>
                        <div className="flex flex-col items-center gap-3 text-slate-500">
                            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm">Cargando información de la empresa...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="flex min-h-[calc(100vh-80px)]">
                    <GerenteSidebar onToggle={handleSidebarToggle} />
                    <div className="flex-1 flex items-center justify-center transition-all duration-300" style={contentStyle}>
                        <div className="flex flex-col items-center gap-4 max-w-md text-center px-6">
                            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger">
                                <Info size={24} />
                            </div>
                            <p className="text-sm text-slate-600">{loadError}</p>
                            <div className="flex gap-3">
                                <Button onClick={cargarEmpresa}>
                                    <RefreshCw size={16} className="mr-2" />
                                    Reintentar
                                </Button>
                                <Button variant="outline" onClick={() => navigate('/gerente')}>
                                    <ArrowLeft size={16} className="mr-2" />
                                    Volver
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="flex min-h-[calc(100vh-80px)]">
                <GerenteSidebar onToggle={handleSidebarToggle} />

                <div className="flex-1 p-6 transition-all duration-300 min-w-0" style={contentStyle}>
                    <div className="max-w-3xl mx-auto space-y-6">

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/gerente')}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <h1 className="text-2xl font-bold text-slate-800">Actualizar Empresa</h1>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm">
                            <Info size={18} className="shrink-0 text-sky-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sky-800">Instrucciones</p>
                                <p className="text-sky-700 mt-0.5">Modifique los campos que desea actualizar. Los cambios se guardarán inmediatamente.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                    <Building2 size={18} className="text-slate-500" />
                                    <h2 className="text-sm font-semibold text-slate-700">Información Básica de la Empresa</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombreEmpresa">
                                            Nombre de la Empresa*
                                            {!hasCambiado('nombreEmpresa') ? (
                                                <span className="ml-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 tracking-wide">Sin cambios</span>
                                            ) : (
                                                <span className="ml-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 tracking-wide">Modificado</span>
                                            )}
                                        </Label>
                                        <Input
                                            type="text"
                                            id="nombreEmpresa"
                                            name="nombreEmpresa"
                                            value={formData.nombreEmpresa}
                                            onChange={handleChange}
                                            className={errors.nombreEmpresa ? 'border-danger' : ''}
                                        />
                                        {errors.nombreEmpresa && (
                                            <p className="text-sm text-danger mt-1">{errors.nombreEmpresa}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nit">
                                            NIT*
                                            {!hasCambiado('nit') ? (
                                                <span className="ml-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 tracking-wide">Sin cambios</span>
                                            ) : (
                                                <span className="ml-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 tracking-wide">Modificado</span>
                                            )}
                                        </Label>
                                        <Input
                                            type="text"
                                            id="nit"
                                            name="nit"
                                            value={formData.nit}
                                            onChange={handleChange}
                                            className={errors.nit ? 'border-danger' : ''}
                                        />
                                        {errors.nit && (
                                            <p className="text-sm text-danger mt-1">{errors.nit}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                    <MapPin size={18} className="text-slate-500" />
                                    <h2 className="text-sm font-semibold text-slate-700">Información de Contacto</h2>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="direccion">
                                        Dirección*
                                        {!hasCambiado('direccion') ? (
                                            <span className="ml-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 tracking-wide">Sin cambios</span>
                                        ) : (
                                            <span className="ml-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 tracking-wide">Modificado</span>
                                        )}
                                    </Label>
                                    <Input
                                        type="text"
                                        id="direccion"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        className={errors.direccion ? 'border-danger' : ''}
                                    />
                                    {errors.direccion && (
                                        <p className="text-sm text-danger mt-1">{errors.direccion}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ciudad">
                                            Ciudad*
                                            {!hasCambiado('ciudad') ? (
                                                <span className="ml-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 tracking-wide">Sin cambios</span>
                                            ) : (
                                                <span className="ml-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 tracking-wide">Modificado</span>
                                            )}
                                        </Label>
                                        <Input
                                            type="text"
                                            id="ciudad"
                                            name="ciudad"
                                            value={formData.ciudad}
                                            onChange={handleChange}
                                            className={errors.ciudad ? 'border-danger' : ''}
                                        />
                                        {errors.ciudad && (
                                            <p className="text-sm text-danger mt-1">{errors.ciudad}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pais">
                                            Pais*
                                            {!hasCambiado('pais') ? (
                                                <span className="ml-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 tracking-wide">Sin cambios</span>
                                            ) : (
                                                <span className="ml-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 tracking-wide">Modificado</span>
                                            )}
                                        </Label>
                                        <Input
                                            type="text"
                                            id="pais"
                                            name="pais"
                                            value={formData.pais}
                                            onChange={handleChange}
                                            className={errors.pais ? 'border-danger' : ''}
                                        />
                                        {errors.pais && (
                                            <p className="text-sm text-danger mt-1">{errors.pais}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="telefono">
                                            Teléfono*
                                            {!hasCambiado('telefono') ? (
                                                <span className="ml-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 tracking-wide">Sin cambios</span>
                                            ) : (
                                                <span className="ml-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 tracking-wide">Modificado</span>
                                            )}
                                        </Label>
                                        <Input
                                            type="text"
                                            id="telefono"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            className={errors.telefono ? 'border-danger' : ''}
                                        />
                                        {errors.telefono && (
                                            <p className="text-sm text-danger mt-1">{errors.telefono}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="correo">
                                            Correo Electrónico*
                                            {!hasCambiado('correo') ? (
                                                <span className="ml-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 tracking-wide">Sin cambios</span>
                                            ) : (
                                                <span className="ml-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 tracking-wide">Modificado</span>
                                            )}
                                        </Label>
                                        <Input
                                            type="email"
                                            id="correo"
                                            name="correo"
                                            value={formData.correo}
                                            onChange={handleChange}
                                            className={errors.correo ? 'border-danger' : ''}
                                        />
                                        {errors.correo && (
                                            <p className="text-sm text-danger mt-1">{errors.correo}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Dialog open={showModal} onOpenChange={(open) => !open && handleCloseModal()}>
                <DialogContent>
                    <div className="py-2">
                        <p className="text-sm text-slate-700">{modalMessage}</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCloseModal}>Aceptar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showCancelModal} onOpenChange={(open) => !open && handleCancelModalClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Descartar cambios</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-sm text-slate-700">{cancelModalMessage}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancelModalClose}>
                            No, continuar editando
                        </Button>
                        <Button variant="destructive" onClick={handleCloseCancelModal}>
                            Sí, descartar cambios
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ActualizarEmpresa;
