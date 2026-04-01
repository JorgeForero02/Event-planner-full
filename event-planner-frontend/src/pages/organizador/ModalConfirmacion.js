import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

const ModalConfirmacion = ({ isOpen, onClose, onConfirm, mensaje }) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirmar eliminación</DialogTitle>
                </DialogHeader>
                <p className="modal-mensaje">{mensaje}</p>
                <DialogFooter>
                    <button className="btn-cancelar" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn-confirmar" onClick={onConfirm}>
                        Sí, eliminar
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ModalConfirmacion;
