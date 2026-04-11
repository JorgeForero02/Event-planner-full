import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../layouts/Sidebar/sidebarAsistente/sidebar';
import Header from '../../layouts/Header/header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';

const Empresa = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    direccion: '',
    id_pais: '',
    id_ciudad: '',
    telefono: '',
    correo: ''
  });

  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchPaises();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (formData.id_pais) {
      fetchCiudades(formData.id_pais);
    } else {
      setCiudades([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.id_pais]);

  const fetchPaises = async () => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('No hay sesión activa');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/paises`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data !== undefined) {
          const paisesData = Array.isArray(result.data) ? result.data : [];
          setPaises(paisesData);

          if (paisesData.length === 0) {
            setError('No hay países disponibles. Por favor, contacte al administrador.');
          } else {
            setError('');
          }
        } else {
          setPaises([]);
          setError('Error en el formato de respuesta de países');
        }
      } else {
        await response.json().catch(() => ({}));
        setError('Error al cargar la lista de países');
        setPaises([]);
      }
    } catch (err) {
      setError('Error al cargar países');
      setPaises([]);
    }
  };

  const fetchCiudades = async (idPais) => {
    try {
      if (!idPais) {
        setCiudades([]);
        return;
      }

      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('No hay sesión activa');
        navigate('/login');
        return;
      }

      const urlsToTry = [
        `${API_URL}/ciudades?pais=${idPais}`,
        `${API_URL}/paises/${idPais}/ciudades`,
        `${API_URL}/ciudades?id_pais=${idPais}`
      ];

      let ciudadesData = [];

      for (const url of urlsToTry) {
        try {
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.status === 401) {
            setError('Sesión expirada. Por favor inicia sesión nuevamente.');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }

          if (response.ok) {
            const result = await response.json();

            if (result.success && result.data) {
              ciudadesData = Array.isArray(result.data)
                ? result.data
                : (result.data.ciudades || result.data.data || []);

              if (ciudadesData.length > 0 && ciudadesData[0].id_pais !== undefined) {
                ciudadesData = ciudadesData.filter(ciudad => String(ciudad.id_pais) === String(idPais));
              }

              setCiudades(ciudadesData);
              return;
            }
          } else {
            await response.json().catch(() => ({ status: response.status }));
          }
        } catch (err) {
          // continue to next URL
        }
      }

      try {
        const response = await fetch(`${API_URL}/ciudades`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const todasLasCiudades = Array.isArray(result.data) ? result.data : [];
            ciudadesData = todasLasCiudades.filter(ciudad =>
              String(ciudad.id_pais) === String(idPais) ||
              String(ciudad.pais_id) === String(idPais) ||
              String(ciudad.idPais) === String(idPais)
            );
            setCiudades(ciudadesData);
            return;
          }
        }
      } catch (fallbackErr) {
      }

      setCiudades([]);

    } catch (err) {
      setError('Error al cargar ciudades');
      setCiudades([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'id_pais') {
      setFormData({
        ...formData,
        id_pais: value,
        id_ciudad: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('No hay sesión activa');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/empresas/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 401) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        setShowSuccessModal(true);
      } else {
        setError(result.message || 'Error al crear la empresa');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/gerente');
  };

  const handleCancel = () => {
    navigate('/asistente');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar onToggle={(collapsed) => setSidebarCollapsed(collapsed)} />

      <div
        className="flex flex-col flex-1 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '80px' : '250px' }}
      >
        <Header />

        <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Solicitud de Afiliación de Empresa</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-4 pb-2 border-b border-slate-200">
              <span>Información Básica de la Empresa</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre de la Empresa<span className="text-danger ml-0.5">*</span>
                </Label>
                <Input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese el nombre de la empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nit">
                  NIT<span className="text-danger ml-0.5">*</span>
                </Label>
                <Input
                  type="text"
                  id="nit"
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese el NIT"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-4 pb-2 border-b border-slate-200">
              <span>Información de Contacto</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="direccion">
                  Dirección<span className="text-danger ml-0.5">*</span>
                </Label>
                <Input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese la dirección"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_pais">
                    País<span className="text-danger ml-0.5">*</span>
                  </Label>
                  <Select
                    id="id_pais"
                    name="id_pais"
                    value={formData.id_pais}
                    onChange={handleChange}
                    required
                    disabled={paises.length === 0}
                  >
                    <option value="">
                      {paises.length === 0
                        ? 'No hay países disponibles'
                        : 'Seleccione un país'}
                    </option>
                    {paises.map(pais => (
                      <option key={pais.id} value={pais.id}>
                        {pais.nombre}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_ciudad">
                    Ciudad<span className="text-danger ml-0.5">*</span>
                  </Label>
                  <Select
                    id="id_ciudad"
                    name="id_ciudad"
                    value={formData.id_ciudad}
                    onChange={handleChange}
                    required
                    disabled={!formData.id_pais}
                  >
                    <option value="">
                      {!formData.id_pais
                        ? 'Primero seleccione un país'
                        : ciudades.length === 0
                          ? 'No hay ciudades disponibles'
                          : 'Seleccione una ciudad'}
                    </option>
                    {ciudades.map(ciudad => (
                      <option key={ciudad.id} value={ciudad.id}>
                        {ciudad.nombre}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">
                    Teléfono<span className="text-danger ml-0.5">*</span>
                  </Label>
                  <Input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    placeholder="Ingrese el teléfono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo">
                    Correo Electrónico<span className="text-danger ml-0.5">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="correo"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                    placeholder="Ingrese el correo electrónico"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </form>
        </div>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 text-xl mx-auto mb-2">✓</div>
            <DialogTitle>¡Empresa Creada Exitosamente!</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-sm">
                <p className="font-medium">Confirmación Enviada</p>
                <p className="text-slate-500">Se ha enviado un correo electrónico con los detalles completos del registro.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-sm">
                <p className="font-medium">Solicitud Pendiente</p>
                <p className="text-slate-500">Tu afiliación está en proceso de revisión por parte del administrador.</p>
              </div>
            </div>

            <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-sm">
              <p>
                <strong>¿Qué sigue ahora?</strong>{' '}
                Recibirás una notificación por correo electrónico cuando tu solicitud sea procesada y aprobada.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleCloseModal}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Empresa;
