import { Eye, EyeOff, Shield, AlertCircle, Lock, Check } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import logo from '../assets/evento-remove.png';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const toggleAdminPasswordVisibility = () => setShowAdminPassword(prev => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdminError('');
    if (!adminEmail.trim() || !adminPassword) {
      setAdminError('Por favor completa todos los campos');
      return;
    }
    setAdminLoading(true);
    try {
      const result = await login(adminEmail, adminPassword, 'admin');
      if (!result.success) throw new Error(result.error || 'Error durante el inicio de sesión de administrador');
      navigate(result.redirectPath || '/admin');
    } catch (err) {
      setAdminError(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#142B6F] to-[#0f1f54] p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 text-center max-w-xs mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6 ring-1 ring-white/20">
            <Shield size={36} className="text-white" />
          </div>
          <img src={logo} alt="EventPlanner" className="h-14 w-auto object-contain mx-auto mb-6 brightness-0 invert opacity-90" />
          <h1 className="text-3xl font-bold text-white mb-3">Zona de Administración</h1>
          <p className="text-blue-200 text-base leading-relaxed">
            Área de acceso restringido para administradores del sistema.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            {[
              'Gestión de usuarios y roles',
              'Aprobación de empresas',
              'Auditoría y estadísticas',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-blue-100 text-sm bg-white/10 rounded-xl px-4 py-2.5">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logo} alt="EventPlanner" className="h-14 w-auto object-contain" />
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            {/* Header */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center gap-2 bg-[#122548] text-white text-sm font-semibold px-4 py-2 rounded-full mb-4">
                <Shield size={14} />
                Acceso Administrativo
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Panel de Administración</h2>
              <p className="text-sm text-slate-500 mt-1.5">Ingresa tus credenciales de administrador</p>
            </div>

            {/* Security notice */}
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
              <Lock size={14} className="text-amber-600 shrink-0" />
              <span className="text-sm font-medium text-amber-800">Esta es una zona de acceso restringido</span>
            </div>

            {adminError && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800 mb-5">
                <AlertCircle size={15} className="shrink-0 text-rose-500" />
                <span>{adminError}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Correo Electrónico
                </label>
                <Input
                  id="admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  disabled={adminLoading}
                  required
                  autoComplete="email"
                  placeholder="admin@ejemplo.com"
                  className="h-10"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={adminLoading}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={toggleAdminPasswordVisibility}
                    disabled={adminLoading}
                    aria-label={showAdminPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showAdminPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={adminLoading}
                className="w-full h-11 bg-[#122548] text-white font-semibold rounded-lg hover:bg-[#1d3a6e] transition-colors mt-2"
              >
                {adminLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield size={16} />
                    Acceder al Panel
                  </span>
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-5">
            Acceso exclusivo para administradores del sistema. ¿No eres administrador?{' '}
            <a href="/login" className="text-[#122548] font-medium hover:underline">Inicio de sesión</a>
          </p>
        </div>
      </div>
    </div>
  );
}