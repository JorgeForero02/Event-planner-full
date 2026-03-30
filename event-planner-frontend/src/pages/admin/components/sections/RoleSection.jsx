import React, { useState, useEffect } from 'react';
import { Search, Info, Edit, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardHeader, CardContent } from '../../../../components/ui/card';
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

const useRolesState = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoles = () => {
      setLoading(true);
      try {
        const savedRoles = localStorage.getItem('rolesState');
        if (savedRoles) {
          setRoles(JSON.parse(savedRoles));
        } else {
          localStorage.setItem('rolesState', JSON.stringify(SYSTEM_ROLES));
          setRoles(SYSTEM_ROLES);
        }
      } catch (error) {
        console.error('Error loading roles:', error);
        setRoles(SYSTEM_ROLES);
      }
      setLoading(false);
    };

    loadRoles();
  }, []);

  const updateRoles = (newRoles) => {
    setRoles(newRoles);
    localStorage.setItem('rolesState', JSON.stringify(newRoles));
  };

  return { roles, loading, updateRoles };
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

const RolesSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { roles, loading, updateRoles } = useRolesState();
  const { notification, showNotification } = useNotification();

  const handleToggleStatus = (rolId) => {
    const rol = roles.find(r => r.id === rolId);
    
    if (!rol.editable) {
      showNotification('error', 'Este rol del sistema no puede ser modificado');
      return;
    }

    const newRoles = roles.map(rol =>
      rol.id === rolId ? { ...rol, activo: !rol.activo } : rol
    );
    
    updateRoles(newRoles);
    showNotification(
      'success', 
      `Rol "${rol.nombre}" ${!rol.activo ? 'activado' : 'desactivado'} exitosamente`
    );
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
          <div className="flex items-center justify-between">
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
                          disabled={!rol.editable}
                          className="h-8 w-8 text-slate-500 hover:text-brand-600 disabled:opacity-50"
                        >
                          <Edit className="h-4 w-4" />
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
    </div>
  );
};

export default RolesSection;
