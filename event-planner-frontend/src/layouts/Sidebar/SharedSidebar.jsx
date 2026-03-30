import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Menu as MenuIcon, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * SharedSidebar — sidebar unificado para los 5 roles.
 *
 * Props:
 *  title         string          — texto en el header (cuando no hay userInfo)
 *  headerIcon    Component|null  — icono Lucide opcional junto al título
 *  items         array           — items de navegación (ver formato abajo)
 *  mode          'router'|'view' — 'router' usa useLocation; 'view' usa currentView
 *  currentView   string          — vista activa en mode='view'
 *  onNavigate    fn(id)          — callback de navegación en mode='view'
 *  onToggle      fn(collapsed)   — notifica al layout cuando colapsa
 *  onLogout      fn              — manejador de cierre de sesión
 *  userInfo      {name, email}   — muestra avatar + nombre en el header
 *  footerSlot    fn(isCollapsed) — render-prop para botones extra en el footer
 *  mobileOpen    bool|undefined  — controla visibilidad móvil (undefined = siempre visible)
 *  expandedWidth string          — clase de ancho expandido (default 'w-64')
 *
 * Formato de item:
 *  { id, label, Icon, path?, altPaths?, view?, submenu?: [{ id, label, path?, view? }] }
 *
 * Formato de footerSlot:
 *  (isCollapsed) => <JSX />
 */
const SharedSidebar = ({
  title,
  headerIcon: HeaderIcon = null,
  items = [],
  mode = 'router',
  currentView,
  onNavigate,
  onToggle,
  onLogout,
  userInfo = null,
  footerSlot = null,
  mobileOpen,
  expandedWidth = 'w-64',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  /* ── Active detection ─────────────────────────────────────────────── */
  const isItemActive = (item) => {
    if (mode !== 'router' || !item.path) return false;
    if (location.pathname === item.path) return true;
    if (item.altPaths?.includes(location.pathname)) return true;
    return false;
  };

  const isSubActive = (sub) => {
    if (mode === 'router') {
      if (!sub.path) return false;
      return (
        location.pathname === sub.path ||
        location.pathname.startsWith(sub.path + '/')
      );
    }
    return currentView === (sub.view ?? sub.id);
  };

  const hasActiveSubmenu = (item) =>
    item.submenu?.some((sub) => isSubActive(sub)) ?? false;

  /* ── Submenu expansion ────────────────────────────────────────────── */
  const computeExpanded = () => {
    const init = {};
    items.forEach((item) => {
      if (item.submenu && hasActiveSubmenu(item)) init[item.id] = true;
    });
    return init;
  };

  const [expandedMenus, setExpandedMenus] = useState(computeExpanded);

  useEffect(() => {
    const next = {};
    items.forEach((item) => {
      if (item.submenu && hasActiveSubmenu(item)) next[item.id] = true;
    });
    setExpandedMenus((prev) => ({ ...prev, ...next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, currentView]);

  /* ── Collapse ─────────────────────────────────────────────────────── */
  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (next) setExpandedMenus({});
    if (onToggle) onToggle(next);
  };

  /* ── Click handlers ───────────────────────────────────────────────── */
  const handleItemClick = (item) => {
    if (item.submenu) {
      if (!isCollapsed)
        setExpandedMenus((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
      return;
    }
    if (mode === 'router' && item.path) {
      navigate(item.path);
    } else if (mode === 'view') {
      if (onNavigate) onNavigate(item.view ?? item.id);
    }
  };

  const handleSubClick = (sub) => {
    if (mode === 'router' && sub.path) {
      navigate(sub.path);
    } else if (mode === 'view') {
      if (onNavigate) onNavigate(sub.view ?? sub.id);
    }
  };

  /* ── Mobile control ───────────────────────────────────────────────── */
  const isMobileControlled = mobileOpen !== undefined;

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-[1000] h-screen bg-sidebar-bg text-white flex flex-col shadow-sidebar',
        'transition-all duration-300',
        isCollapsed ? 'w-16' : expandedWidth,
        isMobileControlled
          ? mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0'
          : 'translate-x-0'
      )}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center px-3 py-4 border-b border-sidebar-border shrink-0',
          isCollapsed ? 'justify-center' : 'justify-between gap-2'
        )}
      >
        {!isCollapsed && (
          userInfo ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-base font-bold shrink-0">
                {userInfo.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{userInfo.name}</p>
                {userInfo.email && (
                  <p className="text-xs text-white/50 truncate">{userInfo.email}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              {HeaderIcon && (
                <HeaderIcon size={18} className="text-brand-400 shrink-0" />
              )}
              <span className="text-sm font-semibold truncate">{title}</span>
            </div>
          )
        )}

        <button
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          className={cn(
            'rounded-lg p-2 text-white/70 hover:text-white hover:bg-sidebar-hover',
            'transition-colors duration-200 shrink-0',
            isCollapsed && 'mx-auto'
          )}
        >
          <MenuIcon size={18} />
        </button>
      </div>

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {items.map((item) => {
          const Icon = item.Icon ?? item.icon;
          const active =
            mode === 'router'
              ? isItemActive(item)
              : currentView === (item.view ?? item.id);
          const submenuActive = hasActiveSubmenu(item);
          const isOpen = expandedMenus[item.id];

          return (
            <div key={item.id}>
              <button
                onClick={() => handleItemClick(item)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer',
                  'transition-colors duration-200',
                  active || submenuActive
                    ? 'bg-brand-600 text-white'
                    : 'text-white/70 hover:text-white hover:bg-sidebar-hover',
                  isCollapsed && 'justify-center'
                )}
              >
                {Icon && <Icon size={18} className="shrink-0" />}
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.submenu && (
                      <ChevronDown
                        size={14}
                        className={cn(
                          'transition-transform duration-200',
                          isOpen && 'rotate-180'
                        )}
                      />
                    )}
                  </>
                )}
              </button>

              {item.submenu && isOpen && !isCollapsed && (
                <div className="mt-0.5 ml-9 space-y-0.5">
                  {item.submenu.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubClick(sub)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-xs font-medium cursor-pointer',
                        'transition-colors duration-200',
                        isSubActive(sub)
                          ? 'bg-brand-500/30 text-brand-300'
                          : 'text-white/60 hover:text-white hover:bg-sidebar-hover'
                      )}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div className="px-2 py-3 border-t border-sidebar-border shrink-0 space-y-0.5">
        {typeof footerSlot === 'function' ? footerSlot(isCollapsed) : footerSlot}
        <button
          onClick={onLogout}
          title={isCollapsed ? 'Cerrar Sesión' : undefined}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer',
            'text-white/70 hover:text-white hover:bg-rose-500/20 transition-colors duration-200',
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

export default SharedSidebar;
