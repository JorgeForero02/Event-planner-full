import React from 'react';
import { useForgotPassword } from '../components/ForgotPassword';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const ForgotPassword = () => {
  const {
    email,
    newPassword,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    error,
    success,
    loading,
    setEmail,
    setNewPassword,
    setConfirmPassword,
    handleResetPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleNavigateToLogin
  } = useForgotPassword();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#142B6F] via-brand-700 to-brand-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md p-8 space-y-6">

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-100 text-brand-600 mb-2">
            <CalendarDays size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Recuperar Contraseña</h2>
          <p className="text-sm text-slate-500">Ingresa tu correo y nueva contraseña</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">

          <div className="space-y-1.5">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || !!success}
                required
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading || !!success}
                required
                className="pl-9 pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={loading || !!success}
                aria-label="Mostrar/Ocultar contraseña"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !!success}
                required
                className="pl-9 pr-10"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                disabled={loading || !!success}
                aria-label="Mostrar/Ocultar contraseña"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading || !!success} className="w-full gap-2 mt-2">
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Actualizando...
              </>
            ) : success ? (
              <><CheckCircle2 size={16} /> Contraseña Actualizada</>
            ) : (
              'Actualizar Contraseña'
            )}
          </Button>
        </form>

        <button
          className="flex items-center justify-center gap-2 w-full text-sm text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
          onClick={handleNavigateToLogin}
          disabled={loading}
        >
          <ArrowLeft size={16} />
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
