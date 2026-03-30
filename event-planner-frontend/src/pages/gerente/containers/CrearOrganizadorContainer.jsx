import React from 'react';
import { useOrganizers } from '../hooks/useOrganizers';
import GerenteSidebar from '../../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import Header from '../../../layouts/Header/header';
import Footer from '../../../layouts/FooterAsistente/footer';
import CreateOrganizerForm from '../components/forms/CreateOrganizerForm';
import NotificationSystem from '../components/shared/NotificationSystem';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';

const CrearOrganizadorContainer = () => {
    const {
        loading,
        loadingEmpresa,
        empresaInfo,
        formData,
        errors,
        apiError,
        success,
        sidebarCollapsed,
        notifications,
        closeNotification,
        handleInputChange,
        handleSubmit,
        handleCancel,
        handleSidebarToggle
    } = useOrganizers();

    if (loadingEmpresa) {
        return (
            <div className="flex min-h-screen bg-slate-50 items-center justify-center">
                <LoadingState message="Cargando informacion de la empresa..." />
            </div>
        );
    }

    if (!empresaInfo) {
        return (
            <div className="flex min-h-screen bg-slate-50 items-center justify-center">
                <ErrorState
                    message={apiError || 'No se pudo cargar la informacion de la empresa'}
                    onRetry={handleCancel}
                />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <GerenteSidebar onToggle={handleSidebarToggle} />
            <div className={`shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`} />

            <NotificationSystem
                notifications={notifications}
                onClose={closeNotification}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header />

                <main className="flex-1 overflow-auto p-6 space-y-5">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Crear Organizador</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Empresa: <span className="font-medium text-slate-700">{empresaInfo.nombre}</span>
                        </p>
                    </div>

                    <CreateOrganizerForm
                        formData={formData}
                        errors={errors}
                        apiError={apiError}
                        success={success}
                        loading={loading}
                        onInputChange={handleInputChange}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default CrearOrganizadorContainer;
