import { Eye, EyeOff, User, Briefcase, Mic, Check, AlertCircle, Calendar } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useLogin } from '../components/login';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';
import logo from '../assets/evento-remove.png';

export default function Login() {
  const {
    email,
    password,
    showPassword,
    error,
    loading,
    setEmail,
    setPassword,
    handleLogin,
    togglePasswordVisibility,
    handleNavigateToForgotPassword,
    handleNavigateToRegister
  } = useLogin();

  const [selectedRole, setSelectedRole] = useState('asistente');

  useEffect(() => {
    return () => {
      localStorage.removeItem('selected_role');
    };
  }, []);

  const roles = [
    { id: 'asistente', name: 'Asistente', subtitle: 'Participante', icon: User },
    { id: 'gerente', name: 'Gerente', subtitle: 'Gerente', icon: Briefcase },
    { id: 'ponente', name: 'Ponente', subtitle: 'Expositor', icon: Mic },
    { id: 'organizador', name: 'Organizador', subtitle: 'Organizador', icon: Calendar },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.setItem('selected_role', selectedRole);
    if (!email.trim() || !password) return;
    await handleLogin(e);
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
          <img src={logo} alt="EventPlanner" className="h-20 w-auto object-contain mx-auto mb-8 brightness-0 invert drop-shadow-lg" />
          <h1 className="text-3xl font-bold text-white mb-3 leading-tight">Bienvenido de vuelta</h1>
          <p className="text-blue-200 text-base leading-relaxed">
            Gestiona tus eventos, actividades y participantes en un solo lugar.
          </p>
          <div className="mt-10 flex flex-col gap-3 text-left">
            {[
              'Organiza eventos de forma profesional',
              'Gestiona ponentes e inscripciones',
              'Reportes y estadísticas en tiempo real',
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h2>
              <p className="text-sm text-slate-500 mt-1">Selecciona tu tipo de cuenta para continuar</p>
            </div>

            {/* Role selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <div
                    key={role.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedRole(role.id)}
                    onKeyDown={(ev) => {
                      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setSelectedRole(role.id); }
                    }}
                    className={cn(
                      'relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 cursor-pointer transition-all select-none',
                      isSelected
                        ? 'border-[#122548] bg-[#f0f4ff] shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                      isSelected ? 'bg-[#122548]' : 'bg-slate-100'
                    )}>
                      <Icon size={15} className={isSelected ? 'text-white' : 'text-slate-500'} />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 leading-tight text-center">{role.name}</p>
                    {isSelected && (
                      <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-[#122548] shadow-sm">
                        <Check size={10} className="text-white" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800 mb-5">
                <AlertCircle size={15} className="shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Correo Electrónico
                </label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  placeholder="tucorreo@ejemplo.com"
                  className="h-10"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    placeholder="••••••••"
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleNavigateToForgotPassword(); }}
                  className="text-sm text-[#122548] hover:underline font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#122548] text-white font-semibold rounded-lg hover:bg-[#1d3a6e] transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : 'Iniciar Sesión'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); handleNavigateToRegister(); }}
                className="text-[#122548] font-medium hover:underline"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}