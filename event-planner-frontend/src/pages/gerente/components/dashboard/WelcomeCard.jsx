import React from 'react';
import { Sparkles } from 'lucide-react';

const WelcomeCard = ({ user }) => {
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 text-white px-6 py-5 flex items-center justify-between shadow-card">
      <div>
        <p className="text-brand-100 text-sm font-medium mb-0.5">{saludo},</p>
        <h2 className="text-xl font-bold leading-tight">
          {user?.nombre || user?.name || 'Gerente'}
        </h2>
        <p className="text-brand-100 text-sm mt-1">Panel de control y gestión empresarial</p>
      </div>
      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <Sparkles size={24} className="text-white" />
      </div>
    </div>
  );
};

export default WelcomeCard;