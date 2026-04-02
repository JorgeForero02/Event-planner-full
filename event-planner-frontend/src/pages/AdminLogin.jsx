import { Eye, EyeOff, Shield, AlertCircle, Lock } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/evento-remove.png';
import './AdminLogin.css';

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
    <div className="admin-login-container">
      <div className="admin-login-card">
        {/* Header */}
        <div className="admin-login-header">
          <div className="admin-logo-box">
            <img src={logo} alt="Logo" />
          </div>
          
          <div className="admin-badge">
            <Shield size={24} />
            <span>Acceso Administrativo</span>
          </div>
          
          <h1 className="admin-title">Panel de Administración</h1>
          <p className="admin-subtitle">Ingresa tus credenciales de administrador para continuar</p>
        </div>

        {/* Alerta de seguridad */}
        <div className="security-notice">
          <Lock size={16} />
          <span>Esta es una zona de acceso restringido</span>
        </div>

        {/* Error */}
        {adminError && (
          <div className="error-box">
            <AlertCircle size={18} />
            <span>{adminError}</span>
          </div>
        )}

        {/* Form */}
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <div className="input-group">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                disabled={adminLoading}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-group">
              <input
                type={showAdminPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                disabled={adminLoading}
                required
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="toggle-pass" 
                onClick={toggleAdminPasswordVisibility}
                disabled={adminLoading}
                aria-label="Mostrar contraseña"
              >
                {showAdminPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="admin-login-button" 
            disabled={adminLoading}
          >
            {adminLoading ? (
              <>
                <span className="spinner"></span>
                Verificando...
              </>
            ) : (
              <>
                <Shield size={18} />
                Acceder al Panel
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}