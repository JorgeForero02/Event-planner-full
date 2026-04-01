import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';

export const ModalExito = ({
    show,
    mensaje,
    onClose,
    titulo = "Operación Exitosa"
}) => {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{titulo}</DialogTitle>
                </DialogHeader>

                <div className="modal-body">
                    <div className="modal-icon success">✅</div>
                    <p>{mensaje}</p>
                </div>

                <DialogFooter>
                    <button
                        className="modal-btn-accept"
                        onClick={onClose}
                    >
                        Aceptar
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};