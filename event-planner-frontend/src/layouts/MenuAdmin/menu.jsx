import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  Users, 
  Menu as MenuIcon,
  ChevronDown,
  LogOut
} from 'lucide-react';
import logoIcon from '../../assets/evento-remove.png';

const Menu = ({ onToggle, onSectionChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeSection = location.pathname.split('/').pop() || 'dashboard';

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    seguridad: false, 
    afiliaciones: false
  });

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      hasSubmenu: false
    },
    {
      id: 'seguridad',
      label: 'Seguridad',
      icon: Shield,
      hasSubmenu: true,
      submenu: [
        { id: 'roles', label: 'Roles' },
        { id: 'usuarios', label: 'Usuarios' }
      ]
    },
    {
      id: 'afiliaciones',
      label: 'Afiliaciones',
      icon: Users,
      hasSubmenu: true,
      submenu: [
        { id: 'afiliaciones-pendientes', label: 'Afiliaciones Pendientes' },
        { id: 'afiliaciones-aprobadas', label: 'Afiliaciones Aprobadas' },
        { id: 'afiliaciones-rechazadas', label: 'Afiliaciones Rechazadas' }
      ]
    }
  ];

  // Auto-expandir menú si hay un subitem activo
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.hasSubmenu && item.submenu) {
        const hasActiveSubmenu = item.submenu.some(sub => sub.id === activeSection);
        if (hasActiveSubmenu) {
          setExpandedMenus(prev => ({
            ...prev,
            [item.id]: true
          }));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const toggleMenu = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  const toggleSubmenu = (menuId) => {
    if (!isCollapsed) {
      setExpandedMenus(prev => ({
        ...prev,
        [menuId]: !prev[menuId]
      }));
    }
  };

  const handleMenuClick = (item) => {
    if (item.hasSubmenu && !isCollapsed) {
      toggleSubmenu(item.id);
    } else if (!item.hasSubmenu) {
      navigate(`/admin/${item.id}`);
      if (onSectionChange) {
        onSectionChange(item.id);
      }
    }
  };

  const handleSubmenuClick = (submenuItem) => {
    navigate(`/admin/${submenuItem.id}`);
    if (onSectionChange) {
      onSectionChange(submenuItem.id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (id) => {
    return activeSection === id;
  };

  const isParentMenuActive = (item) => {
    if (item.hasSubmenu) {
      return false;
    }
    return activeSection === item.id;
  };

  return (
    <aside 
      className={`fixed left-0 top-0 z-[1000] h-screen bg-[#1A2332] text-white flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header / Logo section */}
      <div className="flex items-center justify-between p-4 h-16 shrink-0 border-b border-white/10">
        {!isCollapsed ? (
          <div className="font-bold text-lg truncate pr-2">Panel Admin</div>
        ) : (
          <img 
            src={logoIcon} 
            alt="Event Planner" 
            className="w-8 h-8 object-contain hidden" 
          />
        )}
        <button 
          onClick={toggleMenu} 
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
        >
          <MenuIcon size={20} />
        </button>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const active = isParentMenuActive(item);
          const isExpanded = expandedMenus[item.id];
          const Icon = item.icon;

          return (
            <div key={item.id} className="mb-1">
              <button
                onClick={() => handleMenuClick(item)}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                  active 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon size={20} className="shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate font-medium">{item.label}</span>
                  )}
                </div>
                {!isCollapsed && item.hasSubmenu && (
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                  />
                )}
              </button>

              {/* Submenu rendering */}
              {item.hasSubmenu && isExpanded && !isCollapsed && (
                <div className="ml-9 mt-1 space-y-1">
                  {item.submenu.map((subItem) => {
                    const subActive = isActive(subItem.id);
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubmenuClick(subItem)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          subActive 
                            ? 'bg-white/10 text-white font-medium' 
                            : 'text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {subItem.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer / Logout Button */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <button 
          onClick={handleLogout}
          title="Cerrar Sesión"
          className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Menu;
