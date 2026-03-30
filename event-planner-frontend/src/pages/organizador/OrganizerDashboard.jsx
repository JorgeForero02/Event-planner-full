// OrganizerDashboard.jsx
import React from 'react';
import { useOrganizerDashboard } from '../../components/DashboardOrganizador';
import {
    Header,
    MainContent,
    PasswordModal
} from './OrganizerComponents';
import Sidebar from './Sidebar';

export default function OrganizerDashboard() {
    const {
        activeSection,
        isSidebarOpen,
        stats,
        recentEvents,
        showPasswordModal,
        passwordData,
        showPasswords,
        passwordError,
        passwordSuccess,
        isLoading,
        toggleSidebar,
        closePasswordModal,
        handlePasswordChange,
        togglePasswordVisibility,
        handleSubmitPassword
    } = useOrganizerDashboard();

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

            <PasswordModal
                isOpen={showPasswordModal}
                onClose={closePasswordModal}
                passwordData={passwordData}
                showPasswords={showPasswords}
                passwordError={passwordError}
                passwordSuccess={passwordSuccess}
                isLoading={isLoading}
                onPasswordChange={handlePasswordChange}
                onToggleVisibility={togglePasswordVisibility}
                onSubmit={handleSubmitPassword}
            />
        </div>
    );
}
