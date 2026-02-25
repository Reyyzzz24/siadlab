import { Button } from '@/components/ui/button';
import {
    XMarkIcon,
    HomeModernIcon,
    UserIcon,
    CalendarDaysIcon,
    ClockIcon,
    ChatBubbleBottomCenterTextIcon,
    PrinterIcon
} from '@heroicons/react/24/outline';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export default function DetailModal({ isOpen, onClose, data }: DetailModalProps) {
    if (!isOpen || !data) return null;
    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Peminjaman-${data?.id_transaksi || data?.id}`,
    });

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
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
                            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/30">
                                <HomeModernIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                                Rincian Peminjaman Lab
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 group"
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                        </button>
                    </header>

                    <div className="space-y-5">
                        {/* --- ID TRANSAKSI (HIGHLIGHT) --- */}
                        <div className="flex justify-between items-center p-4 bg-cyan-50/50 dark:bg-cyan-900/10 rounded-2xl">
                            <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">ID Transaksi</span>
                            <code className="text-sm font-mono font-black text-cyan-600 dark:text-cyan-300 uppercase">
                                {data.id_transaksi || `#LND-${data.id}`}
                            </code>
                        </div>

                        {/* --- INFO UTAMA --- */}
                        <div className="px-1 space-y-4">
                            <div className="flex justify-between items-center group">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Nama Peminjam</span>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{data.nama_peminjam}</span>
                            </div>

                            <div className="flex justify-between items-center group">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Laboratorium</span>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 capitalize">
                                        {data.laboratorium?.nama_lab || '-'}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                                        {data.laboratorium?.id_lab || ''}
                                    </p>
                                </div>
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
                        </div>

                        {/* --- WAKTU & TANGGAL --- */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 dark:border-slate-800">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    <CalendarDaysIcon className="w-3 h-3" />
                                    Tanggal
                                </div>
                                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                    {data.tanggal_pinjam ? new Date(data.tanggal_pinjam).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                                </div>
                            </div>
                            <div className="space-y-1 text-right">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest justify-end">
                                    <ClockIcon className="w-3 h-3" />
                                    Sesi Waktu
                                </div>
                                <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                                    {data.waktu_mulai || '--:--'} - {data.waktu_selesai || '--:--'}
                                </div>
                            </div>
                        </div>

                        {/* --- KEPERLUAN --- */}
                        <div className="pt-4 border-t border-gray-50 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                <ChatBubbleBottomCenterTextIcon className="w-3 h-3" />
                                Keperluan Penggunaan
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent dark:border-slate-800">
                                <p className="text-xs leading-relaxed italic text-gray-600 dark:text-gray-300">
                                    "{data.keperluan || 'Tidak ada catatan keperluan khusus.'}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
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