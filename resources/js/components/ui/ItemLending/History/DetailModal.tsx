import { useRef } from 'react'; // Tambahkan ini
import { useReactToPrint } from 'react-to-print'; // Tambahkan ini
import { Button } from '@/components/ui/button';
import {
    XMarkIcon,
    IdentificationIcon,
    CubeIcon,
    HashtagIcon,
    CalendarIcon,
    ClipboardDocumentCheckIcon,
    PrinterIcon // Tambahkan ini
} from '@heroicons/react/24/outline';
import { UserIcon } from 'lucide-react';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export default function DetailModal({ isOpen, onClose, data }: DetailModalProps) {
    const componentRef = useRef<HTMLDivElement>(null); // Ref untuk area yang akan dicetak

    // Fungsi pemicu cetak
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Peminjaman-${data?.id_transaksi || data?.id}`,
    });

    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 transition-all" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl relative border border-transparent dark:border-gray-800 animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Bagian yang akan DICETAK (diberi ref) */}
                <div ref={componentRef} className="print:p-8">
                    {/* Header Section */}
                    <header className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 rounded-2xl print:bg-cyan-50">
                                <IdentificationIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400 print:text-cyan-600" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                                Rincian Riwayat Peminjaman
                            </h3>
                        </div>
                        {/* Tombol Tutup disembunyikan saat cetak */}
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group print:hidden">
                            <XMarkIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                        </button>
                    </header>

                    <div className="space-y-6">
                        {/* ID Transaksi Highlight */}
                        <div className="bg-cyan-50/50 dark:bg-cyan-900/10 p-4 rounded-2xl flex justify-between items-center border border-cyan-100/50 dark:border-cyan-800/20 print:border-cyan-200 print:bg-cyan-50">
                            <div className="flex items-center gap-2">
                                <HashtagIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">ID Transaksi</span>
                            </div>
                            <span className="text-sm font-mono font-black text-cyan-600 dark:text-cyan-300 uppercase">
                                {data.id_transaksi || `LND-${data.id}`}
                            </span>
                        </div>

                        <div className="space-y-4 px-1">
                            {/* Nama Barang */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <CubeIcon className="w-4 h-4" />
                                    <span className="text-xs">Barang</span>
                                </div>
                                <span className="text-sm font-bold text-gray-800">{data.barang?.namabarang || '-'}</span>
                            </div>

                            {/* Jumlah */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <span className="text-[10px] font-bold">QTY</span>
                                    <span className="text-xs">Jumlah</span>
                                </div>
                                <span className="text-sm font-bold text-gray-800">{data.jumlah} Unit</span>
                            </div>

                            {/* Petugas Approval */}
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                    {data.admin ? 'Administrator' : 'Petugas'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <UserIcon className="w-3.5 h-3.5 text-cyan-500" />
                                    <span className="text-sm font-bold text-cyan-600">
                                        {data.admin?.name || data.petugas?.name || 'Belum Diverifikasi'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tanggal Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                    <CalendarIcon className="w-3 h-3" />
                                    Tgl Pinjam
                                </label>
                                <div className="text-sm font-bold text-gray-700">
                                    {data.tanggal_pinjam ? new Date(data.tanggal_pinjam).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                                </div>
                            </div>
                            <div className="space-y-2 text-right">
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider justify-end">
                                    <CalendarIcon className="w-3 h-3 text-green-500" />
                                    Tgl Kembali
                                </label>
                                <div className="text-sm font-bold text-green-600">
                                    {data.tanggal_kembali ? new Date(data.tanggal_kembali).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                                </div>
                            </div>
                        </div>

                        {/* Catatan Section */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">
                                <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                                Catatan Peminjaman
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-gray-600 italic text-xs leading-relaxed">
                                    {data.keterangan || 'Tidak ada catatan tambahan.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons (Disembunyikan saat cetak otomatis oleh react-to-print) */}
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