import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Shield,
    UserCheck,
    ChevronDown,
    Menu as MenuIcon,
    LogOut,
    CalendarDays,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const ICON_MAP = {
    dashboard: LayoutDashboard,
    seguridad: Shield,
    afiliaciones: UserCheck,
};

const Menu = ({ onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({
        seguridad: false,
        afiliaciones: false
    });

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            hasSubmenu: false,
            path: '/admin/dashboard'
        },
        {
            id: 'seguridad',
            label: 'Seguridad',
            hasSubmenu: true,
            submenu: [
                { id: 'roles', label: 'Roles', path: '/admin/roles' },
                { id: 'usuarios', label: 'Usuarios', path: '/admin/usuarios' }
            ]
        },
        {
            id: 'afiliaciones',
            label: 'Afiliaciones',
            hasSubmenu: true,
            submenu: [
                { id: 'afiliaciones-pendientes', label: 'Afiliaciones Pendientes', path: '/admin/afiliaciones-pendientes' },
                { id: 'afiliaciones-aprobadas', label: 'Afiliaciones Aprobadas', path: '/admin/afiliaciones-aprobadas' },
                { id: 'afiliaciones-rechazadas', label: 'Afiliaciones Rechazadas', path: '/admin/afiliaciones-rechazadas' }
            ]
        },
    ];

    const getActiveSection = () => {
        const path = location.pathname;
        if (path === '/admin' || path === '/admin/dashboard') return 'dashboard';
        if (path.includes('/admin/roles')) return 'roles';
        if (path.includes('/admin/usuarios')) return 'usuarios';
        if (path.includes('/admin/afiliaciones-pendientes')) return 'afiliaciones-pendientes';
        if (path.includes('/admin/afiliaciones-aprobadas')) return 'afiliaciones-aprobadas';
        if (path.includes('/admin/afiliaciones-rechazadas')) return 'afiliaciones-rechazadas';
        return 'dashboard';
    };

    const activeSection = getActiveSection();

    useEffect(() => {
        menuItems.forEach(item => {
            if (item.hasSubmenu && item.submenu) {
                const hasActiveSubmenu = item.submenu.some(sub => sub.id === activeSection);
                if (hasActiveSubmenu) {
                    setExpandedMenus(prev => ({ ...prev, [item.id]: true }));
                }
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSection, location]);

    const toggleMenu = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        if (onToggle) onToggle(newState);
    };

    const toggleSubmenu = (menuId) => {
        if (!isCollapsed) {
            setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
        }
    };

    const handleMenuClick = (item) => {
        if (item.hasSubmenu && !isCollapsed) {
            toggleSubmenu(item.id);
        } else if (!item.hasSubmenu && item.path) {
            navigate(item.path);
        }
    };

    const handleSubmenuClick = (submenuItem) => {
        if (submenuItem.path) navigate(submenuItem.path);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isActive = (id) => activeSection === id;
    const shouldShowAsActive = (item) => !item.hasSubmenu && activeSection === item.id;

    return (
        <aside className={cn(
            'fixed left-0 top-0 z-[1000] h-screen bg-[#1A2332] text-white flex flex-col transition-all duration-300',
            isCollapsed ? 'w-16' : 'w-64'
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-4 border-b border-white/10 shrink-0">
                {!isCollapsed && (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <CalendarDays size={20} className="text-brand-400 shrink-0" />
                        <span className="text-sm font-semibold truncate">Panel de Administración</span>
                    </div>
                )}
                <button
                    onClick={toggleMenu}
                    title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
                    className={cn(
                        'rounded-lg p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors',
                        isCollapsed && 'mx-auto'
                    )}
                >
                    <MenuIcon size={18} />
                </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
                {menuItems.map((item) => {
                    const Icon = ICON_MAP[item.id] || LayoutDashboard;
                    const active = shouldShowAsActive(item);
                    const submenuActive = item.hasSubmenu && item.submenu?.some(s => isActive(s.id));

                    return (
                        <div key={item.id}>
                            <button
                                onClick={() => handleMenuClick(item)}
                                title={isCollapsed ? item.label : ''}
                                className={cn(
                                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                    (active || submenuActive)
                                        ? 'bg-brand-600 text-white'
                                        : 'text-white/70 hover:text-white hover:bg-white/10',
                                    isCollapsed && 'justify-center'
                                )}
                            >
                                <Icon size={18} className="shrink-0" />
                                {!isCollapsed && (
                                    <>
                                        <span className="flex-1 text-left">{item.label}</span>
                                        {item.hasSubmenu && (
                                            <ChevronDown size={14} className={cn(
                                                'transition-transform',
                                                expandedMenus[item.id] ? 'rotate-180' : ''
                                            )} />
                                        )}
                                    </>
                                )}
                            </button>

                            {item.hasSubmenu && expandedMenus[item.id] && !isCollapsed && (
                                <div className="mt-0.5 ml-9 space-y-0.5">
                                    {item.submenu.map((subItem) => (
                                        <button
                                            key={subItem.id}
                                            onClick={() => handleSubmenuClick(subItem)}
                                            className={cn(
                                                'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                                                isActive(subItem.id)
                                                    ? 'bg-brand-500/30 text-brand-300'
                                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                            )}
                                        >
                                            {subItem.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
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

export default Menu;
