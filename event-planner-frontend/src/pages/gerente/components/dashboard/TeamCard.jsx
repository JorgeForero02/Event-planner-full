import React from 'react';
import { Users, Key, ClipboardList, Phone, Mail, RefreshCw } from 'lucide-react';

const MemberAvatar = ({ name }) => {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center shrink-0">
      {initial}
    </div>
  );
};

const TeamMember = ({ miembro }) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
    <MemberAvatar name={miembro.usuario.nombre} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800 truncate">{miembro.usuario.nombre}</p>
      <div className="flex items-center gap-1.5 mt-0.5">
        {miembro.rol === 'gerente'
          ? <Key size={11} className="text-amber-500 shrink-0" />
          : <ClipboardList size={11} className="text-brand-500 shrink-0" />}
        <span className="text-xs text-slate-500 capitalize">{miembro.rol}</span>
      </div>
    </div>
    <div className="hidden sm:flex flex-col items-end gap-0.5 text-right">
      <span className="text-xs text-slate-500 flex items-center gap-1">
        <Mail size={10} />{miembro.usuario.correo}
      </span>
      {miembro.usuario.telefono && (
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Phone size={10} />{miembro.usuario.telefono}
        </span>
      )}
    </div>
  </div>
);

const TeamCard = ({ equipo, onReload }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-card">
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <Users size={18} className="text-brand-600" />
        <h3 className="text-sm font-semibold text-slate-700">Equipo de Trabajo</h3>
      </div>
      {onReload && (
        <button onClick={onReload} className="text-slate-400 hover:text-brand-600 transition-colors" title="Recargar">
          <RefreshCw size={14} />
        </button>
      )}
    </div>

    <div className="px-5 py-1">
      {equipo.length === 0 ? (
        <div className="py-8 text-center">
          <Users size={32} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No hay miembros en el equipo</p>
        </div>
      ) : (
        equipo.map((miembro) => (
          <TeamMember key={miembro.id} miembro={miembro} />
        ))
      )}
    </div>
  </div>
);

export default TeamCard;