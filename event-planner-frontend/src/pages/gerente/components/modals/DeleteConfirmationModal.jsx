import React from 'react';
import { X, Trash2 } from 'lucide-react';

const DeleteConfirmationModal = ({
    item,
    itemType,
    itemName,
    onConfirm,
    onClose
}) => {
    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-modal w-full max-w-md p-6 space-y-5 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-800">Confirmar Eliminación</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Warning */}
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center">
                        <Trash2 size={26} className="text-rose-600" />
                    </div>
                    <p className="text-sm text-slate-700">
                        ¿Está seguro de que desea eliminar la {itemType}{' '}
                        <strong className="text-slate-900">“{itemName}”</strong>?
                    </p>
                    <p className="text-xs text-rose-600 font-medium">Esta acción no se puede deshacer.</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors"
                    >
                        Eliminar {itemType}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;