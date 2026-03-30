import React from 'react';
import {
    ClipboardList,
    CalendarDays,
    FileText,
    LayoutDashboard,
} from 'lucide-react';
import SharedSidebar from '../SharedSidebar';

const navItems = [
    { id: 'dashboard',   view: 'dashboard',   label: 'Dashboard',      Icon: LayoutDashboard },
    { id: 'eventos',     view: 'eventos',      label: 'Eventos',         Icon: CalendarDays    },
    { id: 'actividades', view: 'actividades',  label: 'Mis Actividades', Icon: ClipboardList   },
    { id: 'encuestas',   view: 'encuestas',    label: 'Encuestas',       Icon: FileText        },
];

const Sidebar = ({ onToggle, onNavigate, currentView }) => {
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <SharedSidebar
            title="Panel de Ponente"
            items={navItems}
            mode="view"
            currentView={currentView}
            onNavigate={onNavigate}
            onToggle={onToggle}
            onLogout={handleLogout}
        />
    );
};

export default Sidebar;
