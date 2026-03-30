// components/OrganizerComponents.jsx
import React from 'react';
import { Lock, X, Eye, EyeOff, Menu, AlertCircle, CheckCircle2, CalendarDays, TrendingUp } from 'lucide-react';
import KpiCard from '../../components/ui/KpiCard';
import EventosPage from './Eventos/EventosPageOrganizador';
import ActividadesPage from './Actividades/ActividadesPage';
import EncuestasManager from './Encuestas/EncuestasManager';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/utils';

export const PasswordModal = ({
    isOpen,
    onClose,
    passwordData,
    showPasswords,
    passwordError,
    passwordSuccess,
    isLoading,
    onPasswordChange,
    onToggleVisibility,
    onSubmit
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-modal w-full max-w-md mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                        <Lock size={20} className="text-brand-600" />
                        Cambiar Contraseña
                    </h3>
                    <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="pm-correo">Correo Electrónico</Label>
                        <Input
                            id="pm-correo"
                            type="email"
                            value={passwordData.correo}
                            onChange={(e) => onPasswordChange('correo', e.target.value)}
                            placeholder="Ej: usuario@ejemplo.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="pm-nueva">Nueva Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="pm-nueva"
                                type={showPasswords.nueva ? 'text' : 'password'}
                                value={passwordData.contraseñaNueva}
                                onChange={(e) => onPasswordChange('contraseñaNueva', e.target.value)}
                                placeholder="Mínimo 8 caracteres"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => onToggleVisibility('nueva')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPasswords.nueva ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="pm-confirmar">Confirmar Nueva Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="pm-confirmar"
                                type={showPasswords.confirmar ? 'text' : 'password'}
                                value={passwordData.confirmarContraseña}
                                onChange={(e) => onPasswordChange('confirmarContraseña', e.target.value)}
                                placeholder="Repite la nueva contraseña"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => onToggleVisibility('confirmar')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPasswords.confirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
                        <p className="font-medium mb-1">Requisitos de la contraseña:</p>
                        <ul className="space-y-0.5 list-none pl-0">
                            <li>• Mínimo 8 caracteres</li>
                            <li>• Al menos una letra mayúscula</li>
                            <li>• Al menos un número</li>
                        </ul>
                    </div>

                    {passwordError && (
                        <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                            <AlertCircle size={16} className="shrink-0" />
                            <p>{passwordError}</p>
                        </div>
                    )}

                    {passwordSuccess && (
                        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                            <CheckCircle2 size={16} className="shrink-0" />
                            <p>{passwordSuccess}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button onClick={onSubmit} disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Cambiar Contraseña'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
const colorVariantMap = {
    'bg-brand-600':   'brand',
    'bg-blue':        'brand',
    'bg-emerald-600': 'success',
    'bg-green-600':   'success',
    'bg-amber-500':   'warning',
    'bg-yellow-500':  'warning',
    'bg-rose-500':    'danger',
    'bg-red-500':     'danger',
    'bg-purple':      'default',
};

const colorIconMap = {
    'bg-brand-600':   CalendarDays,
    'bg-blue':        CalendarDays,
    'bg-emerald-600': TrendingUp,
    'bg-green-600':   TrendingUp,
    'bg-amber-500':   AlertCircle,
    'bg-yellow-500':  AlertCircle,
    'bg-rose-500':    AlertCircle,
    'bg-red-500':     AlertCircle,
    'bg-purple':      TrendingUp,
};

export const StatCard = ({ label, value, color }) => (
    <KpiCard
        title={label}
        value={value}
        icon={colorIconMap[color] ?? TrendingUp}
        variant={colorVariantMap[color] ?? 'default'}
    />
);

// Fila de evento
export const EventRow = ({ event }) => (
    <div className="flex items-center justify-between py-3 px-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors rounded-lg">
        <div>
            <p className="text-sm font-medium text-slate-800">{event.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{event.date}</p>
        </div>
        <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            event.status === 'published' ? 'bg-brand-100 text-brand-700' :
            event.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
            event.status === 'finished' ? 'bg-emerald-100 text-emerald-700' :
            'bg-slate-100 text-slate-600'
        )}>
            {event.status}
        </span>
    </div>
);

export const MainContent = ({ activeSection, stats, recentEvents }) => (
    <div className="flex-1 overflow-auto p-6">
        {activeSection === 'inicio' && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <h2 className="text-base font-semibold text-slate-800">Eventos Recientes</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentEvents.map((event, index) => (
                            <EventRow key={index} event={event} />
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeSection === 'eventos' && <EventosPage />}
        {activeSection === 'actividades' && <ActividadesPage />}
        {activeSection === 'encuestas' && <EncuestasManager />}

        {activeSection !== 'inicio' &&
            activeSection !== 'eventos' &&
            activeSection !== 'actividades' &&
            activeSection !== 'encuestas' && (
                <div className="flex items-center justify-center h-64">
                    <p className="text-slate-500">Contenido de {activeSection} - En desarrollo</p>
                </div>
            )}
    </div>
);

export const Header = ({ isSidebarOpen, onToggleSidebar }) => (
    <header className="h-14 flex items-center px-4 border-b border-slate-200 bg-white shrink-0">
        <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
    </header>
);
