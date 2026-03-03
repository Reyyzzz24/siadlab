import React from 'react';
import { Modal } from "@/components/ui/modal";
import { Button } from '@/components/ui/button';
import { CreditCardIcon } from '@heroicons/react/24/outline';

interface PaymentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: any;
    formatRupiah: (val: number) => string;
    onPayNowClick?: (payment: any) => void;
}

export const PaymentDetailModal = ({ 
    isOpen, 
    onClose, 
    payment, 
    formatRupiah,
    onPayNowClick 
}: PaymentDetailModalProps) => {
    if (!payment) return null;

    // Tombol hanya muncul jika metode transfer DAN status belum_bayar
    const showPayButton = payment.jenis_pembayaran === 'transfer' && payment.status === 'belum_bayar';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Rincian Pembayaran"
            maxWidth="md"
            // PINDAHKAN FOOTER KE SINI
            footer={
                <div className="flex w-full gap-2">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Tutup
                    </Button>
                    
                    {showPayButton && (
                        <Button 
                            className="flex-1"
                            onClick={() => {
                                if (onPayNowClick) onPayNowClick(payment);
                            }}
                        >
                            <CreditCardIcon className="w-4 h-4 mr-2" />
                            Bayar Sekarang
                        </Button>
                    )}
                </div>
            }
        >
            <div className="space-y-6">
                {/* ID Transaksi */}
                {payment.id_transaksi && (
                    <div className="flex justify-between items-center p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/20">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">ID Transaksi</span>
                        </div>
                        <code className="text-sm font-mono font-black text-indigo-600 dark:text-indigo-300 uppercase">
                            {payment.id_transaksi}
                        </code>
                    </div>
                )}

                {/* Detail Info */}
                <div className="px-1 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Kategori</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100 capitalize">
                            {payment.kategori.replace('_', ' ')}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Metode Pembayaran</span>
                        <span className="text-sm font-bold uppercase text-blue-600 dark:text-blue-400">
                            {payment.jenis_pembayaran}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Status Pembayaran</span>
                        <span className={`px-3 py-1 font-bold rounded-full text-[10px] uppercase tracking-wider border ${
                            payment.status === 'lunas'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : payment.status === 'menunggu_konfirmasi'
                                ? 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400'
                                : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                            {payment.status.replace('_', ' ')}
                        </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Nominal</span>
                        <span className="text-base font-black text-gray-900 dark:text-white">
                            {formatRupiah(payment.nominal)}
                        </span>
                    </div>
                </div>

                {/* Catatan */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Catatan Transaksi</p>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-transparent dark:border-gray-700">
                        <p className="text-xs leading-relaxed italic text-gray-600 dark:text-gray-300">
                            "{payment.keterangan || 'Tidak ada catatan transaksi.'}"
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};