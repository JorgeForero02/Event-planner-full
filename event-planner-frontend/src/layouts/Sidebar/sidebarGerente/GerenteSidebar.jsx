// src/layouts/Sidebar/sidebarGerente/GerenteSidebar.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    CalendarDays,
    ChevronDown,
    Menu as MenuIcon,
    LogOut,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const GerenteSidebar = ({ onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [empresaOpen, setEmpresaOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);
        if (onToggle) onToggle(newCollapsedState);
        if (newCollapsedState) setEmpresaOpen(false);
    };

    const handleEmpresaClick = () => {
        if (!isCollapsed) setEmpresaOpen(!empresaOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const empresaSubItems = [
        { path: '/gerente/actualizar-empresa', label: 'Actualizar Información' },
        { path: '/gerente/ubicaciones',        label: 'Ubicaciones'            },
        { path: '/gerente/lugares',            label: 'Lugares'                },
        { path: '/gerente/crear-organizador',  label: 'Crear Organizador'      },
    ];

    const empresaActive = empresaSubItems.some(s => isActive(s.path));

    return (
        <aside className={cn(
            'fixed left-0 top-0 z-[1000] h-screen bg-[#1A2332] text-white flex flex-col transition-all duration-300',
            isCollapsed ? 'w-16' : 'w-64'
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-4 border-b border-white/10 shrink-0">
                {!isCollapsed && (
                    <span className="text-sm font-semibold truncate">Panel de Gerente</span>
                )}
                <button
                    onClick={toggleSidebar}
                    title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
                    className={cn(
                        'rounded-lg p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors',
                        isCollapsed && 'mx-auto'
                    )}
                >
                    <MenuIcon size={18} />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
                {/* Dashboard */}
                <button
                    onClick={() => navigate('/gerente')}
                    title={isCollapsed ? 'Dashboard' : ''}
                    className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive('/gerente')
                            ? 'bg-brand-600 text-white'
                            : 'text-white/70 hover:text-white hover:bg-white/10',
                        isCollapsed && 'justify-center'
                    )}
                >
                    <LayoutDashboard size={18} className="shrink-0" />
                    {!isCollapsed && <span>Dashboard</span>}
                </button>

                {/* Empresa (submenu) */}
                <div>
                    <button
                        onClick={handleEmpresaClick}
                        title={isCollapsed ? 'Empresa' : ''}
                        className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            empresaActive
                                ? 'bg-brand-600 text-white'
                                : 'text-white/70 hover:text-white hover:bg-white/10',
                            isCollapsed && 'justify-center'
                        )}
                    >
                        <Building2 size={18} className="shrink-0" />
                        {!isCollapsed && (
                            <>
                                <span className="flex-1 text-left">Empresa</span>
                                <ChevronDown size={14} className={cn(
                                    'transition-transform',
                                    empresaOpen ? 'rotate-180' : ''
                                )} />
                            </>
                        )}
                    </button>

                    {empresaOpen && !isCollapsed && (
                        <div className="mt-0.5 ml-9 space-y-0.5">
                            {empresaSubItems.map(({ path, label }) => (
                                <button
                                    key={path}
                                    onClick={() => navigate(path)}
                                    className={cn(
                                        'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                                        isActive(path)
                                            ? 'bg-brand-500/30 text-brand-300'
                                            : 'text-white/60 hover:text-white hover:bg-white/10'
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Eventos */}
                <button
                    onClick={() => navigate('/gerente/eventos')}
                    title={isCollapsed ? 'Eventos' : ''}
                    className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive('/gerente/eventos')
                            ? 'bg-brand-600 text-white'
                            : 'text-white/70 hover:text-white hover:bg-white/10',
                        isCollapsed && 'justify-center'
                    )}
                >
                    <CalendarDays size={18} className="shrink-0" />
                    {!isCollapsed && <span>Eventos</span>}
                </button>
            </nav>

            {/* Logout */}
            <div className="px-2 py-3 border-t border-white/10 shrink-0">
                <button
                    onClick={handleLogout}
                    title="Cerrar Sesión"
                    className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-rose-500/20 transition-colors',
                        isCollapsed && 'justify-center'
                    )}
                >
                    <LogOut size={18} className="shrink-0" />
                    {!isCollapsed && <span>Cerrar Sesión</span>}
                </button>
            </div>
        </aside>
    );
};

export default GerenteSidebar;
