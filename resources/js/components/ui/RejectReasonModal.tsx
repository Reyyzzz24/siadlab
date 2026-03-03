import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

export default function RejectReasonModal({ isOpen, onClose, onSubmit }: Props) {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (!isOpen) setReason('');
    }, [isOpen]);

    const handleSubmit = () => {
        onSubmit(reason.trim());
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Alasan Penolakan" maxWidth="md">
            <div className="space-y-4">
                <p className="text-sm text-gray-600">Masukkan alasan penolakan (opsional) agar pengguna menerima penjelasan.</p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={5}
                    className="w-full p-3 border rounded-md bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-slate-200"
                    placeholder="Contoh: Jadwal bentrok, peralatan tidak tersedia..."
                />

                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose} className="flex-1">Batal</Button>
                    <Button onClick={handleSubmit} className="flex-1">Kirim & Tolak</Button>
                </div>
            </div>
        </Modal>
    );
}
