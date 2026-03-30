import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarDays,
    ClipboardList,
    FileText,
    Menu as MenuIcon,
    LogOut,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const navItems = [
    { view: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { view: 'eventos',   label: 'Eventos',   Icon: CalendarDays   },
    { view: 'agenda',    label: 'Agenda',    Icon: ClipboardList  },
    { view: 'encuestas', label: 'Encuestas', Icon: FileText       },
];

const Sidebar = ({ onToggle, onNavigate, currentView }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggle) onToggle(newCollapsedState);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const isActive = (view) => currentView === view;

  return (
    <aside className={cn(
        'fixed left-0 top-0 z-[1000] h-screen bg-[#1A2332] text-white flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-white/10 shrink-0">
        {!isCollapsed && (
          <span className="text-sm font-semibold truncate">Panel de Asistente</span>
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
        {navItems.map(({ view, label, Icon }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            title={isCollapsed ? label : ''}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive(view)
                ? 'bg-brand-600 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10',
              isCollapsed && 'justify-center'
            )}
          >
            <Icon size={18} className="shrink-0" />
            {!isCollapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom: register company link + logout */}
      <div className="px-2 py-3 border-t border-white/10 shrink-0 space-y-1">
        {!isCollapsed && (
          <p className="text-xs text-white/40 px-3 py-1">
            <span
              onClick={() => navigate('/asistente/empresa')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/asistente/empresa'); }}
              className="cursor-pointer hover:text-white/70 transition-colors"
            >
              ¿Quieres registrar tu empresa?
            </span>
          </p>
        )}
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

export default Sidebar;
