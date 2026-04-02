import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CalendarDays,
    ClipboardList,
    FileText,
    LayoutDashboard,
    BookOpen,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import SharedSidebar from '../SharedSidebar';

const navItems = [
    { id: 'dashboard',       path: '/asistente/dashboard',      label: 'Dashboard',         Icon: LayoutDashboard },
    { id: 'eventos',         path: '/asistente/eventos',         label: 'Eventos',            Icon: CalendarDays    },
    { id: 'agenda',          path: '/asistente/agenda',          label: 'Agenda',             Icon: ClipboardList   },
    { id: 'inscripciones',   path: '/asistente/inscripciones',   label: 'Mis Inscripciones',  Icon: BookOpen        },
    { id: 'encuestas',       path: '/asistente/encuestas',       label: 'Encuestas',          Icon: FileText        },
];

const Sidebar = ({ onToggle }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const footerSlot = (isCollapsed) =>
        !isCollapsed ? (
            <p className="text-xs text-white/40 px-3 py-1">
                <span
                    onClick={() => navigate('/asistente/empresa')}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') navigate('/asistente/empresa');
                    }}
                    className={cn('cursor-pointer hover:text-white/70 transition-colors duration-200')}
                >
                    ¿Quieres registrar tu empresa?
                </span>
            </p>
        ) : null;

    return (
        <SharedSidebar
            title="Panel de Asistente"
            items={navItems}
            mode="router"
            onToggle={onToggle}
            onLogout={handleLogout}
            footerSlot={footerSlot}
        />
    );
};

export default Sidebar;
