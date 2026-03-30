import { useNavigate } from 'react-router-dom';
import { isAdmin, isAsistente, isGerente, isOrganizador, isPonente } from '../../utils/roleUtils';
import { CalendarDays } from 'lucide-react';
import notificationsIcon from '../../assets/notifications.png';
import NotificacionesDropdown from '../../contexts/NotificacionesDropdown';

const Header = ({ isMenuCollapsed }) => {
  const navigate = useNavigate();

  let user = null;
  const raw = localStorage.getItem('user');
  if (raw) user = JSON.parse(raw);

  const email = (user?.email || user?.correo || user?.username || '')?.toString();

  let displayRole = '';
  if (isAdmin(user)) displayRole = 'Administrador';
  else if (isAsistente(user)) displayRole = 'Asistente';
  else if (isOrganizador(user)) displayRole = 'Organizador';
  else if (isGerente(user)) displayRole = 'Gerente';
  else if (isPonente(user)) displayRole = 'Ponente';

  const nameSource = (email).toString();
  const initials = nameSource
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(s => s[0].toUpperCase())
    .join('') || 'U';

  const handleLogoClick = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-[100] h-14 bg-white border-b border-slate-200 flex items-center justify-between px-5 shrink-0">
      {/* Left — brand logo / logout */}
      <button
        className="flex items-center gap-2 text-brand-600 hover:text-brand-700 transition-colors"
        onClick={handleLogoClick}
        type="button"
        title="Cerrar sesión"
      >
        <CalendarDays size={22} className="shrink-0" />
        <span className="font-bold text-sm hidden sm:inline tracking-tight">Event Planner</span>
      </button>

      {/* Right — notifications + user info + avatar */}
      <div className="flex items-center gap-3">
        <NotificacionesDropdown notificationsIcon={notificationsIcon} />

        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-xs font-semibold text-slate-700">{displayRole}</span>
          <span className="text-xs text-slate-500 max-w-[180px] truncate">{email || '—'}</span>
        </div>

        <div
          className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold select-none shrink-0"
          title={email || 'Usuario'}
        >
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Header;