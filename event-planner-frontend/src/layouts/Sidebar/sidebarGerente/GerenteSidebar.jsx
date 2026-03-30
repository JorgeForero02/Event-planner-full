// src/layouts/Sidebar/sidebarGerente/GerenteSidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    CalendarDays,
    LayoutDashboard,
} from 'lucide-react';
import SharedSidebar from '../SharedSidebar';

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
        submenu: [
            { id: 'actualizar-empresa',  label: 'Actualizar Información', path: '/gerente/actualizar-empresa' },
            { id: 'ubicaciones',         label: 'Ubicaciones',            path: '/gerente/ubicaciones'        },
            { id: 'lugares',             label: 'Lugares',                path: '/gerente/lugares'            },
            { id: 'crear-organizador',   label: 'Crear Organizador',      path: '/gerente/crear-organizador'  },
        ],
    },
    {
        id: 'eventos',
        label: 'Eventos',
        Icon: CalendarDays,
        path: '/gerente/eventos',
    },
];

const GerenteSidebar = ({ onToggle }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
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
