import React, { useState } from 'react';
import { useGerenteDashboard } from '../hooks/useGerenteDashboard';
import GerenteSidebar from '../../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import Header from '../../../layouts/Header/header';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import StatsCards from '../components/dashboard/StatsCards';
import TeamCard from '../components/dashboard/TeamCard';
import ActivitiesCard from '../components/dashboard/ActivitiesCard';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import Footer from '../../../layouts/FooterAsistente/footer';

const GerenteDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    user,
    equipo,
    stats,
    loading,
    error,
    reloadTeam
  } = useGerenteDashboard();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <LoadingState message="Cargando dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <ErrorState message={error} onRetry={reloadTeam} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <GerenteSidebar onToggle={setSidebarCollapsed} />
      <div className={`shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-auto p-6 space-y-6">
          <WelcomeCard user={user} />
          <StatsCards stats={stats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamCard equipo={equipo} onReload={reloadTeam} />
            <ActivitiesCard />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default GerenteDashboard;
