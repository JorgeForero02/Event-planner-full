// OrganizerDashboard.jsx
import React from 'react';
import { useOrganizerDashboard } from '../../components/DashboardOrganizador';
import { Header, MainContent } from './OrganizerComponents';
import Sidebar from './Sidebar';

export default function OrganizerDashboard() {
    const { activeSection, isSidebarOpen, stats, recentEvents, toggleSidebar } = useOrganizerDashboard();

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 ml-[280px]">
                <Header
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={toggleSidebar}
                />
                <MainContent
                    activeSection={activeSection}
                    stats={stats}
                    recentEvents={recentEvents}
                />
            </div>
        </div>
    );
}
