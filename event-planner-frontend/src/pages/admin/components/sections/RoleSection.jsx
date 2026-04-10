import React, { useState, useEffect, useCallback } from 'react';
import { Search, Info, Edit, AlertCircle, CheckCircle2, X, Loader2, Plus } from 'lucide-react';
import { API_URL } from '../../../../config/apiConfig';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardHeader, CardContent } from '../../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';

const SYSTEM_ROLES = [
  {
    id: 1,
    nombre: 'Administrador',
    tipo: 'administrador',
    descripcion: 'Control total del sistema',
    activo: true,
    editable: false,
    esSistema: true
  },
  {
    id: 2,
    nombre: 'Gerente',
    tipo: 'gerente',
    descripcion: 'Control en la organización',
    activo: true,
    editable: true,
    esSistema: false
  },
  {
    id: 3,
    nombre: 'Organizador',
    tipo: 'organizador',
    descripcion: 'Gestión de eventos empresariales',
    activo: true,
    editable: true,
    esSistema: false
  },
  {
    id: 4,
    nombre: 'Ponente',
    tipo: 'ponente',
    descripcion: 'Experto quien dirige la charla',
    activo: true,
    editable: true,
    esSistema: false
  },
  {
    id: 5,
    nombre: 'Asistente',
    tipo: 'asistente',
    descripcion: 'Participante de eventos',
    activo: true,
    editable: true,
    esSistema: false
  }
];

const getToken = () => localStorage.getItem('access_token');

const useRolesState = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const cargarRoles = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const resp = await fetch(`${API_URL}/admin/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        const rolesApi = data.data.map(r => ({
          ...SYSTEM_ROLES.find(s => s.tipo === r.tipo) || {},
          ...r,
          id: SYSTEM_ROLES.find(s => s.tipo === r.tipo)?.id ?? r.tipo
        }));
        const administrador = SYSTEM_ROLES.find(r => r.tipo === 'administrador');
        setRoles([administrador, ...rolesApi]);
      } else {
        setRoles(SYSTEM_ROLES);
      }
    } catch {
      setRoles(SYSTEM_ROLES);
    }
    setLoading(false);
  }, []);

  useEffect(() => { cargarRoles(); }, [cargarRoles]);

  const toggleRol = async (tipo, nuevoActivo, showNotification) => {
    setToggling(tipo);
    try {
      const token = getToken();
      const resp = await fetch(`${API_URL}/admin/roles/${tipo}/toggle-estado`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: nuevoActivo })
      });
      const data = await resp.json();
      if (!resp.ok) {
        showNotification('error', data.message || 'Error al cambiar estado del rol');
      } else {
        showNotification('success', data.message);
        await cargarRoles();
      }
    } catch {
      showNotification('error', 'Error de conexión al servidor');
    }
    setToggling(null);
  };

  return { roles, loading, toggling, toggleRol, cargarRoles };
};

const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message, duration = 4000) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  };

  return { notification, showNotification };
};

const Notification = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className={`flex items-center gap-3 p-4 mb-4 rounded-lg border ${
      notification.type === 'success' 
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
        : 'bg-rose-50 border-rose-200 text-rose-800'
    }`}>
      {notification.type === 'success' ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-rose-500" />
      )}
      <p className="flex-1 text-sm font-medium">{notification.message}</p>
      <button onClick={onClose} className="rounded-md hover:bg-black/5 p-1 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const useCrearRol = (cargarRoles) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: '', tipo: '', descripcion: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!form.tipo.trim()) e.tipo = 'El identificador es obligatorio';
    else if (!/^[a-z_]+$/.test(form.tipo)) e.tipo = 'Solo letras minúsculas y guiones bajos';
    return e;
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = async (showNotification) => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/roles`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear rol');
      showNotification('success', data.message || 'Rol creado correctamente');
      setOpen(false);
      setForm({ nombre: '', tipo: '', descripcion: '' });
      await cargarRoles();
    } catch (err) {
      showNotification('error', err.message || 'Error al crear rol');
    }
    setSaving(false);
  };

  return { open, setOpen, saving, form, errors, handleChange, handleSubmit };
};

const RolesSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { roles, loading, toggling, toggleRol, cargarRoles } = useRolesState();
  const { notification, showNotification } = useNotification();
  const crear = useCrearRol(cargarRoles);

  const handleToggleStatus = async (rolId) => {
    const rol = roles.find(r => r.id === rolId);
    if (!rol?.editable) {
      showNotification('error', 'Este rol del sistema no puede ser modificado');
      return;
    }
    await toggleRol(rol.tipo, !rol.activo, showNotification);
  };

  const filteredRoles = roles.filter(rol =>
    rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Notification 
        notification={notification} 
        onClose={() => showNotification(null)} 
      />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestión de Roles</h1>
        <p className="text-slate-500">Listado y administración de roles del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => crear.setOpen(true)} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Crear Rol
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Cargando roles...</TableCell>
                  </TableRow>
                ) : filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                      No se encontraron roles que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map(rol => (
                    <TableRow key={rol.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{rol.nombre}</span>
                          {rol.esSistema && (
                            <Badge variant="outline" className="bg-slate-50 text-xs">Sistema</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          rol.activo 
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80" 
                            : "bg-slate-100 text-slate-700 hover:bg-slate-100/80"
                        }>
                          {rol.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{rol.descripcion}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(rol.id)}
                          title={!rol.editable ? 'Rol del sistema no modificable' : (rol.activo ? 'Desactivar rol' : 'Activar rol')}
                          disabled={!rol.editable || toggling === rol.tipo}
                          className="h-8 w-8 text-slate-500 hover:text-brand-600 disabled:opacity-50"
                        >
                          {toggling === rol.tipo
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Edit className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
        <div>
          <p>Los roles marcados como "Sistema" no pueden ser modificados.</p>
          <p>Solo los roles editables pueden activarse o desactivarse.</p>
          <p>Los roles inactivos no estarán disponibles al crear nuevos usuarios.</p>
        </div>
      </div>

      <Dialog open={crear.open} onOpenChange={crear.setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Crear nuevo rol</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="rol-nombre">Nombre *</Label>
              <Input
                id="rol-nombre"
                value={crear.form.nombre}
                onChange={(e) => crear.handleChange('nombre', e.target.value)}
                placeholder="Ej: Coordinador"
              />
              {crear.errors.nombre && <p className="text-sm text-danger">{crear.errors.nombre}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rol-tipo">Identificador único *</Label>
              <Input
                id="rol-tipo"
                value={crear.form.tipo}
                onChange={(e) => crear.handleChange('tipo', e.target.value.toLowerCase())}
                placeholder="Ej: coordinador"
              />
              <p className="text-xs text-slate-500">Solo letras minúsculas y guiones bajos. No se puede cambiar después.</p>
              {crear.errors.tipo && <p className="text-sm text-danger">{crear.errors.tipo}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rol-descripcion">Descripción</Label>
              <Textarea
                id="rol-descripcion"
                value={crear.form.descripcion}
                onChange={(e) => crear.handleChange('descripcion', e.target.value)}
                rows={2}
                placeholder="Describe las responsabilidades del rol..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => crear.setOpen(false)} disabled={crear.saving}>Cancelar</Button>
            <Button onClick={() => crear.handleSubmit(showNotification)} disabled={crear.saving} className="gap-2">
              {crear.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {crear.saving ? 'Creando...' : 'Crear rol'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesSection;
