import { Button } from '@/components/ui/button';
import {
    XMarkIcon,
    BanknotesIcon,
    TagIcon,
    CreditCardIcon,
    DocumentTextIcon,
    HashtagIcon,
    PrinterIcon
} from '@heroicons/react/24/outline';
import { UserIcon } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export default function TransactionDetailModal({ isOpen, onClose, data }: TransactionDetailModalProps) {
    if (!isOpen || !data) return null;
    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Pembayaran-${data?.id_transaksi || data?.id}`,
    });

    // Helper untuk format Rupiah
    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-all"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border-none animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div ref={componentRef} className="print:p-8">
                    {/* --- HEADER --- */}
                    <header className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                                <BanknotesIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                                Rincian Riwayat Transaksi
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 group"
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                        </button>
                    </header>

                    <div className="space-y-6">
                        {/* --- ID TRANSAKSI (HIGHLIGHT) --- */}
                        <div className="flex justify-between items-center p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/20">
                            <div className="flex items-center gap-2">
                                <HashtagIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">ID Transaksi</span>
                            </div>
                            <code className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-300 uppercase">
                                {data.id_transaksi || `#${data.id}`}
                            </code>
                        </div>

                        {/* --- INFO DETAIL --- */}
                        <div className="px-1 space-y-4">
                            {/* Kategori */}
                            <div className="flex justify-between items-center group">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                    <span className="text-xs">Kategori</span>
                                </div>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-100 capitalize">
                                    {data.kategori?.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Metode */}
                            <div className="flex justify-between items-center group">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                    <span className="text-xs">Metode Pembayaran</span>
                                </div>
                                <span className="text-sm font-bold uppercase text-blue-600 dark:text-blue-400">
                                    {data.jenis_pembayaran}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {data.admin ? 'Administrator' : 'Petugas'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <UserIcon className="w-3.5 h-3.5 text-cyan-500" />
                                    <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                                        {/* Cek nama admin dulu, jika kosong baru cek nama petugas */}
                                        {data.admin?.name || data.petugas?.name || 'Belum Diverifikasi'}
                                    </span>
                                </div>
                            </div>

                            {/* Nominal */}
                            <div className="flex justify-between items-center group pt-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Nominal</span>
                                <span className="text-lg font-black text-gray-900 dark:text-white">
                                    {formatRupiah(data.nominal)}
                                </span>
                            </div>
                        </div>

                        {/* --- CATATAN --- */}
                        <div className="pt-4 border-t border-gray-50 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                                <DocumentTextIcon className="w-3.5 h-3.5" />
                                Catatan Transaksi
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent dark:border-slate-800">
                                <p className="text-xs leading-relaxed italic text-gray-600 dark:text-gray-300">
                                    "{data.keterangan || 'Tidak ada catatan transaksi.'}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* --- FOOTER ACTION --- */}
                <div className="flex gap-2 mt-8">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 gap-2 border-cyan-200 text-cyan-600 hover:bg-cyan-50"
                        onClick={() => handlePrint()}
                    >
                        <PrinterIcon className="w-4 h-4" />
                        Cetak Detail
                    </Button>
                    <Button
                        variant="emerald"
                        className="flex-1 h-12 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                        onClick={onClose}
                    >
                        Tutup Riwayat
                    </Button>
                </div>
            </div>
        </div>
    );
}   