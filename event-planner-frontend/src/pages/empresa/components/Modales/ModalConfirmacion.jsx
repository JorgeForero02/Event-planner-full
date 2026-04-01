import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';

export const ModalConfirmacion = ({
    show,
    mensaje,
    onConfirm,
    onCancel,
    titulo = "Confirmar Acción"
}) => {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <span className="modal-icon warning">⚠️</span> {titulo}
                    </DialogTitle>
                </DialogHeader>

                <div className="modal-body">
                    <p>{mensaje}</p>
                </div>

                <DialogFooter>
                    <button
                        className="modal-btn-cancel"
                        onClick={onCancel}
                    >
                        No, continuar editando
                    </button>
                    <button
                        className="modal-btn-confirm"
                        onClick={onConfirm}
                    >
                        Sí, descartar cambios
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};