import React from 'react';
import { Lock, Menu, X, Eye, EyeOff } from 'lucide-react';
import { useSidebar } from '../../components/SideBarOrganizador';
import SharedSidebar from '../../layouts/Sidebar/SharedSidebar';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ onSectionChange }) => {
    const {
        isOpen,
        user,
        activeSection,
        menuItems,
        showPasswordModal,
        passwordData,
        showPasswords,
        passwordError,
        passwordSuccess,
        isLoading,
        handleMenuClick,
        toggleSidebar,
        openPasswordModal,
        closePasswordModal,
        handlePasswordChange,
        togglePasswordVisibility,
        handleSubmitPassword,
        handleLogout
    } = useSidebar();

    const navigate = useNavigate();

    const onMenuClickHandler = (sectionId) => {
        handleMenuClick(sectionId);
        if (onSectionChange) onSectionChange(sectionId);
    };

    /* ── Footer slot: cambiar contraseña ─────────────────────────────── */
    const footerSlot = (isCollapsed) => (
        <button
            onClick={openPasswordModal}
            title={isCollapsed ? 'Cambiar Contraseña' : undefined}
            className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer',
                'text-white/70 hover:text-white hover:bg-sidebar-hover transition-colors duration-200',
                isCollapsed && 'justify-center'
            )}
        >
            <Lock size={18} className="shrink-0" />
            {!isCollapsed && <span>Cambiar Contraseña</span>}
        </button>
    );

    return (
        <>
            {/* ── Mobile toggle button ─────────────────────────────── */}
            <button
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
                className="fixed top-4 left-4 z-[1001] bg-brand-500 hover:bg-brand-600 text-white rounded-lg p-2 shadow-md transition-all duration-200 md:hidden"
            >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* ── SharedSidebar ─────────────────────────────────────── */}
            <SharedSidebar
                title="Panel de Organizador"
                items={menuItems}
                mode="view"
                currentView={activeSection}
                onNavigate={onMenuClickHandler}
                onLogout={handleLogout}
                userInfo={{ name: user?.nombre, email: user?.correo }}
                footerSlot={footerSlot}
                mobileOpen={isOpen}
                expandedWidth="w-[280px]"
            />

            {/* ── Modal: cambiar contraseña ─────────────────────────── */}
            {showPasswordModal && (
                <div
                    className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={closePasswordModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-modal p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold text-slate-900 mb-5">Cambiar Contraseña</h2>

                        <div className="space-y-4">
                            {/* Correo (disabled) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Correo electrónico
                                </label>
                                <Input
                                    type="email"
                                    value={passwordData.correo}
                                    disabled
                                    className="bg-slate-50 text-slate-500"
                                />
                            </div>

                            {/* Nueva contraseña */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nueva contraseña
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPasswords.nueva ? 'text' : 'password'}
                                        value={passwordData.contraseñaNueva}
                                        onChange={(e) => handlePasswordChange('contraseñaNueva', e.target.value)}
                                        placeholder="Mínimo 8 caracteres"
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('nueva')}
                                        aria-label="Toggle"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPasswords.nueva ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirmar contraseña */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Confirmar contraseña
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPasswords.confirmar ? 'text' : 'password'}
                                        value={passwordData.confirmarContraseña}
                                        onChange={(e) => handlePasswordChange('confirmarContraseña', e.target.value)}
                                        placeholder="Repite la contraseña"
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirmar')}
                                        aria-label="Toggle"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPasswords.confirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Alertas */}
                        {passwordError && (
                            <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-800">
                                {passwordError}
                            </div>
                        )}
                        {passwordSuccess && (
                            <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
                                {passwordSuccess}
                            </div>
                        )}

                        {/* Acciones */}
                        <div className="flex gap-3 justify-end mt-6">
                            <Button
                                variant="outline"
                                onClick={closePasswordModal}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmitPassword}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
