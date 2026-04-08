import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClockIcon } from "lucide-react";

interface Props {
    nominal: number;
    timeLeft: number;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onFileChange: (file: File | null) => void;
    formatRupiah: (val: number) => string;
    formatTime: (seconds: number) => string;
}

export const TransferPaymentContent = ({ 
    nominal, timeLeft, processing, onSubmit, onFileChange, formatRupiah, formatTime 
}: Props) => (
    <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl font-mono text-sm dark:text-gray-300 border border-dashed border-gray-300 dark:border-gray-600 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase mb-1">Rekening Tujuan</p>
            <span className="text-lg font-bold block text-gray-800 dark:text-gray-100">BANK SYARIAH INDONESIA</span>
            <span className="text-xl tracking-widest block my-1 text-blue-600 dark:text-blue-400">7253703126</span>
            <span className="block">a.n. Abdullah</span>
        </div>

        <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm dark:text-gray-300">Total Nominal:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{formatRupiah(nominal)}</span>
        </div>

        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
            <ClockIcon className="w-5 h-5 text-red-600 animate-pulse" />
            <p className="text-sm text-red-600 font-bold">
                Sisa waktu upload: {formatTime(timeLeft)}
            </p>
        </div>

        <form id="transfer-upload-form" onSubmit={onSubmit} className="space-y-4">
            <div>
                <Label className="mb-1">Upload Bukti Bayar</Label>
                <input
                    type="file"
                    name="bukti_bayar"
                    className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 dark:bg-gray-800 dark:text-gray-300 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                    required
                />
            </div>
        </form>
    </div>
);