import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, CreditCard, Briefcase, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api/authService';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import logo from '../../assets/evento-remove.png';

function FormField({ label, optional, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{optional && <span className="text-slate-400 font-normal ml-1">(opcional)</span>}
      </label>
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
        {children}
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('asistente');
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    especialidad: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRoleSelect = (role) => { setSelectedRole(role); setError(''); };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) { setError('El nombre es obligatorio'); return false; }
    if (!formData.cedula.trim()) { setError('La cedula es obligatoria'); return false; }
    if (!formData.correo.trim()) { setError('El correo electronico es obligatorio'); return false; }
    if (!/\S+@\S+\.\S+/.test(formData.correo)) { setError('El correo electronico no es valido'); return false; }
    if (!formData.contrasena) { setError('La contrasena es obligatoria'); return false; }
    if (formData.contrasena.length < 6) { setError('La contrasena debe tener al menos 6 caracteres'); return false; }
    if (formData.contrasena !== formData.confirmarContrasena) { setError('Las contrasenas no coinciden'); return false; }
    if (selectedRole === 'ponente' && !formData.especialidad.trim()) { setError('La especialidad es obligatoria para ponentes'); return false; }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        nombre: formData.nombre,
        cedula: formData.cedula,
        telefono: formData.telefono || null,
        correo: formData.correo,
        contraseña: formData.contrasena,
        rol: selectedRole
      };
      if (selectedRole === 'ponente') payload.especialidad = formData.especialidad;
      const result = await authService.register(payload);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'asistente', name: 'Asistente', subtitle: 'Participante', icon: User },
    { id: 'ponente', name: 'Ponente', subtitle: 'Expositor', icon: Briefcase },
  ];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#142B6F] to-[#0f1f54] p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Registro Exitoso!</h2>
          <p className="text-sm text-slate-500">Tu cuenta ha sido creada. Redirigiendo al inicio de sesion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-5/12 flex-col items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#142B6F] to-[#0f1f54] p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 text-center max-w-xs mx-auto">
          <img src={logo} alt="EventPlanner" className="h-20 w-auto object-contain mx-auto mb-8 brightness-0 invert drop-shadow-lg" />
          <h1 className="text-3xl font-bold text-white mb-3 leading-tight">Crea tu cuenta</h1>
          <p className="text-blue-200 text-base leading-relaxed">
            Unete a la plataforma y empieza a participar en los mejores eventos.
          </p>
          <div className="mt-10 flex flex-col gap-3 text-left">
            {['Accede a eventos exclusivos', 'Gestiona tus inscripciones facilmente', 'Recibe notificaciones y recordatorios'].map((item) => (
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

      <div className="flex-1 flex items-start justify-center bg-slate-50 p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex justify-center mb-6">
            <img src={logo} alt="EventPlanner" className="h-14 w-auto object-contain" />
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Crear cuenta</h2>
              <p className="text-sm text-slate-500 mt-1">Selecciona tu tipo de cuenta y completa tus datos</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {roles.map(({ id, name, subtitle, icon: Icon }) => {
                const isSelected = selectedRole === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleRoleSelect(id)}
                    className={cn(
                      'relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 cursor-pointer transition-all select-none',
                      isSelected ? 'border-[#122548] bg-[#f0f4ff] shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <div className={cn('flex items-center justify-center w-9 h-9 rounded-lg transition-colors', isSelected ? 'bg-[#122548]' : 'bg-slate-100')}>
                      <Icon size={16} className={isSelected ? 'text-white' : 'text-slate-500'} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-400">{subtitle}</p>
                    {isSelected && (
                      <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-[#122548] shadow-sm">
                        <Check size={10} className="text-white" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <form className="space-y-4" onSubmit={handleRegister}>
              <FormField label="Nombre Completo" icon={User}>
                <Input name="nombre" type="text" value={formData.nombre} onChange={handleInputChange} placeholder="Tu nombre completo" className="h-10 pl-9" disabled={loading} />
              </FormField>

              <FormField label="Cedula" icon={CreditCard}>
                <Input name="cedula" type="text" value={formData.cedula} onChange={handleInputChange} placeholder="Numero de cedula" className="h-10 pl-9" disabled={loading} />
              </FormField>

              <FormField label="Telefono" optional icon={Phone}>
                <Input name="telefono" type="tel" value={formData.telefono} onChange={handleInputChange} placeholder="Numero de telefono" className="h-10 pl-9" disabled={loading} />
              </FormField>

              <FormField label="Correo Electronico" icon={Mail}>
                <Input name="correo" type="email" value={formData.correo} onChange={handleInputChange} placeholder="tucorreo@ejemplo.com" className="h-10 pl-9" disabled={loading} />
              </FormField>

              {selectedRole === 'ponente' && (
                <FormField label="Especialidad" icon={Briefcase}>
                  <Input name="especialidad" type="text" value={formData.especialidad} onChange={handleInputChange} placeholder="Ej: Marketing Digital, Tecnologia..." className="h-10 pl-9" disabled={loading} />
                </FormField>
              )}

              <FormField label="Contrasena" icon={Lock}>
                <Input name="contrasena" type={showPassword ? 'text' : 'password'} value={formData.contrasena} onChange={handleInputChange} placeholder="Minimo 6 caracteres" className="h-10 pl-9 pr-10" disabled={loading} />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </FormField>

              <FormField label="Confirmar Contrasena" icon={Lock}>
                <Input name="confirmarContrasena" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmarContrasena} onChange={handleInputChange} placeholder="Repite tu contrasena" className="h-10 pl-9 pr-10" disabled={loading} />
                <button type="button" onClick={() => setShowConfirmPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </FormField>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
                  <AlertCircle size={15} className="shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-10 bg-[#122548] text-white font-semibold rounded-lg hover:bg-[#1d3a6e] transition-colors mt-1">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creando cuenta...
                  </span>
                ) : 'Crear Cuenta'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Ya tienes cuenta?{' '}
              <a href="/login" className="text-[#122548] font-medium hover:underline">Inicia sesion aqui</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
