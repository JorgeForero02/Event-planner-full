// src/layouts/Sidebar/sidebarGerente/GerenteSidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    CalendarDays,
    LayoutDashboard,
    BarChart3,
    Users,
} from 'lucide-react';
import SharedSidebar from '../SharedSidebar';

const SUBMENU_BASE = [
    { id: 'actualizar-empresa',        label: 'Actualizar Información',  path: '/gerente/actualizar-empresa'        },
    { id: 'solicitudes-actualizacion', label: 'Solicitudes de Cambio',   path: '/gerente/solicitudes-actualizacion' },
];

const SUBMENU_REQUIERE_ACTIVA = [
    { id: 'ubicaciones',     label: 'Ubicaciones',      path: '/gerente/ubicaciones'      },
    { id: 'lugares',         label: 'Lugares',           path: '/gerente/lugares'          },
    { id: 'crear-organizador', label: 'Crear Organizador', path: '/gerente/crear-organizador' },
];

const GerenteSidebar = ({ onToggle }) => {
    const navigate = useNavigate();

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            Icon: LayoutDashboard,
            path: '/gerente',
            altPaths: ['/gerente/'],
        },
        {
            id: 'empresa',
            label: 'Empresa',
            Icon: Building2,
            submenu: [...SUBMENU_BASE, ...SUBMENU_REQUIERE_ACTIVA],
        },
        {
            id: 'equipo',
            label: 'Equipo',
            Icon: Users,
            path: '/gerente/equipo',
        },
        {
            id: 'eventos',
            label: 'Eventos',
            Icon: CalendarDays,
            path: '/gerente/eventos',
        },
        {
            id: 'reporte-desempenho',
            label: 'Reporte de Desempeño',
            Icon: BarChart3,
            path: '/gerente/reporte-desempenho',
        },
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    return (
        <SharedSidebar
            title="Panel de Gerente"
            items={menuItems}
            mode="router"
            onToggle={onToggle}
            onLogout={handleLogout}
        />
    );
};

export default GerenteSidebar;
