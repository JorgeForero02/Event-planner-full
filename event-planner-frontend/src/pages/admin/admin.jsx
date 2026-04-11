import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Menu from '../../layouts/MenuAdmin/menu';
import Header from '../../layouts/Header/header';
import Roles from './components/sections/RoleSection';
import Usuarios from './components/sections/UsuariosSection';
import AfiliacionesPendientes from './components/sections/AfiliacionesPendientesSection';
import AfiliacionesAprobadas from './components/sections/AfiliacionesAprobadasSection';
import AfiliacionesRechazadas from './components/sections/AfiliacionesRechazadasSection';
import AdminDashboard from './components/dashboard/AdminDashboard';
import AuditoriaSection from './components/sections/AuditoriaSection';
import { cn } from '../../lib/utils';

const Admin = () => {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Menu onToggle={setIsMenuCollapsed} />

      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        isMenuCollapsed ? "ml-16" : "ml-64"
      )}>
        <Header isSidebarCollapsed={isMenuCollapsed} />
        <div className="flex-1 overflow-auto p-6">
          <Routes>

            <Route index element={<Navigate to="dashboard" replace />} />
            
            <Route path="dashboard" element={<AdminDashboard />} />
            
            <Route path="roles" element={<Roles />} />
            
            <Route path="usuarios" element={<Usuarios />} />
            
            <Route path="afiliaciones-pendientes" element={<AfiliacionesPendientes />} />
            <Route path="afiliaciones-aprobadas" element={<AfiliacionesAprobadas />} />
            <Route path="afiliaciones-rechazadas" element={<AfiliacionesRechazadas />} />
            
            <Route path="auditoria" element={<AuditoriaSection />} />

            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Admin;
