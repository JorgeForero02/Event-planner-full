import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isAsistente } from '../../utils/roleUtils';

const Footer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAffiliationClick = () => {
    navigate('/asistente/empresa');
  };

  if (!isAsistente(user)) return null;

  return (
    <footer className="bg-white border-t border-slate-200 py-4 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-slate-500">
        <div className="flex items-center gap-1.5">
          <Building2 size={14} className="text-brand-500 shrink-0" />
          <i>¿Te gustaría registrar tu empresa para organizar eventos?</i>
        </div>
        <p>
          Haz{' '}
          <button
            onClick={handleAffiliationClick}
            className="font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-2 transition-colors"
            type="button"
          >
            clic aquí
          </button>
          {' '}para solicitar el formulario de afiliación empresarial.
        </p>
      </div>
    </footer>
  );
};

export default Footer;