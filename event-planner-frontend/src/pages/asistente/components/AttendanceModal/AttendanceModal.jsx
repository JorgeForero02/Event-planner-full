import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';

const AttendanceModal = ({ inscripcion, onClose, onConfirm, loading = false }) => {
    const [codigoAsistencia, setCodigoAsistencia] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (codigoAsistencia.trim()) {
            onConfirm(codigoAsistencia);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && !loading && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar Asistencia</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-md bg-slate-50 border border-slate-200 p-4 text-sm space-y-1">
                        <p className="font-medium">{inscripcion.evento?.nombre}</p>
                        <p><strong>Fecha:</strong> {inscripcion.evento?.fecha}</p>
                        <p><strong>Hora:</strong> {inscripcion.evento?.hora}</p>
                        <p><strong>Modalidad:</strong> {inscripcion.evento?.modalidad}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="codigoAsistencia">
                                Código de Asistencia *
                            </Label>
                            <Input
                                type="text"
                                id="codigoAsistencia"
                                value={codigoAsistencia}
                                onChange={(e) => setCodigoAsistencia(e.target.value.toUpperCase())}
                                placeholder="Ingresa el código proporcionado por el organizador"
                                required
                                disabled={loading}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={!codigoAsistencia.trim() || loading}
                            >
                                {loading ? 'Registrando...' : 'Registrar Asistencia'}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AttendanceModal;
