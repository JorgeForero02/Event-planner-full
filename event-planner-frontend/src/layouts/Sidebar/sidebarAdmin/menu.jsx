import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CalendarDays,
    LayoutDashboard,
    Shield,
    UserCheck,
} from 'lucide-react';
import SharedSidebar from '../SharedSidebar';

const menuItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        Icon: LayoutDashboard,
        path: '/admin/dashboard',
        altPaths: ['/admin'],
    },
    {
        id: 'seguridad',
        label: 'Seguridad',
        Icon: Shield,
        submenu: [
            { id: 'roles',    label: 'Roles',    path: '/admin/roles'    },
            { id: 'usuarios', label: 'Usuarios', path: '/admin/usuarios' },
        ],
    },
    {
        id: 'afiliaciones',
        label: 'Afiliaciones',
        Icon: UserCheck,
        submenu: [
            { id: 'afiliaciones-pendientes',  label: 'Afiliaciones Pendientes',  path: '/admin/afiliaciones-pendientes'  },
            { id: 'afiliaciones-aprobadas',   label: 'Afiliaciones Aprobadas',   path: '/admin/afiliaciones-aprobadas'   },
            { id: 'afiliaciones-rechazadas',  label: 'Afiliaciones Rechazadas',  path: '/admin/afiliaciones-rechazadas'  },
        ],
    },
];

const Menu = ({ onToggle }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <SharedSidebar
            title="Panel de Administración"
            headerIcon={CalendarDays}
            items={menuItems}
            mode="router"
            onToggle={onToggle}
            onLogout={handleLogout}
        />
    );
};

export default Menu;
