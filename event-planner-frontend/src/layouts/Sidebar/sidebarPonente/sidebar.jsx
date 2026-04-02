import React from 'react';
import {
    ClipboardList,
    CalendarDays,
    FileText,
    LayoutDashboard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SharedSidebar from '../SharedSidebar';

const navItems = [
    { id: 'dashboard',   path: '/ponente',             label: 'Dashboard',      Icon: LayoutDashboard },
    { id: 'eventos',     path: '/ponente/eventos',      label: 'Eventos',         Icon: CalendarDays    },
    { id: 'actividades', path: '/ponente/actividades',  label: 'Mis Actividades', Icon: ClipboardList   },
    { id: 'encuestas',   path: '/ponente/encuestas',    label: 'Encuestas',       Icon: FileText        },
];

const Sidebar = ({ onToggle }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    return (
        <SharedSidebar
            title="Panel de Ponente"
            items={navItems}
            mode="router"
            onToggle={onToggle}
            onLogout={handleLogout}
        />
    );
};

export default Sidebar;
