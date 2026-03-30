import { Eye, EyeOff, User, Briefcase, Mic, Check, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useLogin } from '../components/login';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';
import logo from '../assets/evento-remove.png';

export default function Login() {
  // Usar el hook useLogin para la lógica de autenticación
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

  // Estados locales solo para la UI del login
  const [selectedRole, setSelectedRole] = useState('asistente');

  // Limpiar el rol guardado del localStorage al desmontar el componente
  useEffect(() => {
    return () => {
      localStorage.removeItem('selected_role');
    };
  }, []);

  const roles = [
    { id: 'asistente', name: 'Asistente', subtitle: 'Participante', icon: User },
    { id: 'gerente', name: 'Gerente', subtitle: 'Gerente', icon: Briefcase },
    { id: 'ponente', name: 'Ponente', subtitle: 'Expositor', icon: Mic },
    { id: 'organizador', name: 'Organizador', subtitle: 'Organizador', icon: User }

  ];

  // Handler mejorado que incluye el rol
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guardar el rol seleccionado antes de hacer login
    localStorage.setItem('selected_role', selectedRole);

    // Validación básica
    if (!email.trim() || !password) {
      return;
    }

    // Llamar al handleLogin del hook
    await handleLogin(e);
  };

  return (
    /* Fondo gradiente — coherente con la paleta brand */
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#142B6F] via-[#173578] to-[#122548] p-6 font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-modal p-8 sm:p-10">

        {/* ── Logo & subtítulo ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={logo}
            alt="EventPlanner"
            className="h-16 w-auto object-contain mb-3"
          />
          <p className="text-sm text-slate-500">Selecciona tu tipo de cuenta para continuar</p>
        </div>

        {/* ── Selector de roles ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
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
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    setSelectedRole(role.id);
                  }
                }}
                className={cn(
                  'relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3.5 cursor-pointer transition-all select-none',
                  isSelected
                    ? 'border-brand-700 bg-brand-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                {/* Icono */}
                <div className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-lg',
                  isSelected ? 'bg-[#122548]' : 'bg-slate-400'
                )}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-tight text-center">{role.name}</p>
                {/* Checkmark cuando está seleccionado */}
                {isSelected && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-[#122548]">
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Error inline ──────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800 mb-4">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Formulario ────────────────────────────────────────────────── */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
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
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1">
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
            className="w-full h-10 bg-[#122548] text-white font-semibold rounded-lg hover:bg-[#1d3a6e] transition-colors shadow-sm"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Button>
        </form>

        {/* ── Registro ──────────────────────────────────────────────────── */}
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
  );
}