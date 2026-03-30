import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, CreditCard, Briefcase, CalendarDays, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { cn } from '../lib/utils';

export default function Register() {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  const [selectedRole, setSelectedRole] = useState('asistente');
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    contraseña: '',
    confirmarContraseña: '',
    especialidad: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    if (!formData.cedula.trim()) {
      setError('La cédula es obligatoria');
      return false;
    }
    if (!formData.correo.trim()) {
      setError('El correo electrónico es obligatorio');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      setError('El correo electrónico no es válido');
      return false;
    }
    if (!formData.contraseña) {
      setError('La contraseña es obligatoria');
      return false;
    }
    if (formData.contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.contraseña !== formData.confirmarContraseña) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (selectedRole === 'ponente' && !formData.especialidad.trim()) {
      setError('La especialidad es obligatoria para ponentes');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nombre: formData.nombre,
        cedula: formData.cedula,
        telefono: formData.telefono || null,
        correo: formData.correo,
        contraseña: formData.contraseña,
        rol: selectedRole
      };

      if (selectedRole === 'ponente') {
        payload.especialidad = formData.especialidad;
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error durante el registro');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (err) {
      console.error('Error durante el registro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#142B6F] via-brand-700 to-brand-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-modal p-10 max-w-sm w-full mx-4 text-center space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">¡Registro Exitoso!</h2>
          <p className="text-slate-500 text-sm">Tu cuenta ha sido creada. Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  const roles = [
    { id: 'asistente', label: 'Asistente', description: 'Participante', Icon: User },
    { id: 'ponente',   label: 'Ponente',   description: 'Expositor',    Icon: Briefcase },
  ];

  const inputFields = [
    { name: 'nombre',   label: 'Nombre Completo',  type: 'text',  Icon: User,        required: true },
    { name: 'cedula',   label: 'Cédula',            type: 'text',  Icon: CreditCard,  required: true },
    { name: 'telefono', label: 'Teléfono',          type: 'tel',   Icon: Phone,       required: false },
    { name: 'correo',   label: 'Correo Electrónico',type: 'email', Icon: Mail,        required: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#142B6F] via-brand-700 to-brand-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md p-8 space-y-6">

        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-100 text-brand-600 mb-2">
            <CalendarDays size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Crear Cuenta</h1>
        </div>

        {/* Role selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600">Selecciona tu tipo de cuenta</p>
          <div className="grid grid-cols-2 gap-3">
            {roles.map(({ id, label, description, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleRoleSelect(id)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium',
                  selectedRole === id
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-slate-50'
                )}
              >
                <Icon size={24} />
                <span className="font-semibold">{label}</span>
                <span className="text-xs opacity-70">{description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {inputFields.map(({ name, label, type, Icon, required }) => (
            <div key={name} className="space-y-1.5">
              <Label htmlFor={`reg-${name}`}>
                {label}{' '}
                {!required && <span className="text-slate-400 font-normal">(opcional)</span>}
              </Label>
              <div className="relative">
                <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id={`reg-${name}`}
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleInputChange}
                  className="pl-9"
                  required={required}
                />
              </div>
            </div>
          ))}

          {/* Ponente speciality */}
          {selectedRole === 'ponente' && (
            <div className="space-y-1.5">
              <Label htmlFor="reg-especialidad">Especialidad</Label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="reg-especialidad"
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleInputChange}
                  placeholder="Ej: Marketing Digital, Tecnología, etc."
                  className="pl-9"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-password">Contraseña</Label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="contraseña"
                value={formData.contraseña}
                onChange={handleInputChange}
                className="pl-9 pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-confirm">Confirmar Contraseña</Label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                id="reg-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmarContraseña"
                value={formData.confirmarContraseña}
                onChange={handleInputChange}
                className="pl-9 pr-10"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={16} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <Button type="button" onClick={handleRegister} disabled={loading} className="w-full">
            {loading ? (
              <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Registrando...</>
            ) : 'Crear Cuenta'}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-brand-600 font-medium hover:underline">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
}