import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

interface Props {
    onConfirm: () => void;
    onCancel: () => void;
}

export const CashConfirmationContent = ({ onConfirm, onCancel }: Props) => (
    <div className="text-center py-2">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-10 h-10" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 px-4">
            Yakin ingin membayar secara <span className="font-bold text-gray-800 dark:text-gray-200">Cash/Tunai</span>?
            Status akan berubah menjadi menunggu konfirmasi admin setelah Anda menekan tombol bayar.
        </p>
        <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
                Batal
            </Button>
            <Button onClick={onConfirm} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                Ya, Bayar Sekarang
            </Button>
        </div>
    </div>
);