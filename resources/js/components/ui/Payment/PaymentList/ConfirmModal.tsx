import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export const ConfirmActionModal = ({ isOpen, onClose, onConfirm, data, reason, setReason }: any) => {
    if (!isOpen) return null;

    const isLunas = data?.status === 'lunas';

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-slate-800">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${isLunas ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <ExclamationTriangleIcon className={`w-8 h-8 ${isLunas ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {isLunas ? 'Setujui Pembayaran?' : 'Tolak Pembayaran?'}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                    Pastikan Anda telah memeriksa bukti transfer mahasiswa secara teliti sebelum melanjutkan aksi ini.
                </p>

                {data?.status === 'ditolak' && (
                    <div className="mb-4">
                        <label className="block text-sm text-gray-700 dark:text-slate-300 mb-2">Alasan Penolakan</label>
                        <textarea
                            className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-slate-200"
                            rows={3}
                            value={reason || ''}
                            onChange={(e) => setReason?.(e.target.value)}
                            placeholder="Masukkan alasan penolakan (opsional)"
                        />
                    </div>
                )}

                <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        className="flex-1 h-12 rounded-xl dark:border-slate-700 dark:text-slate-300" 
                        onClick={onClose}
                    >
                        Batal
                    </Button>
                    <Button
                        className={`flex-1 h-12 rounded-xl text-white font-bold ${isLunas ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20' : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20'}`}
                        onClick={onConfirm}
                    >
                        Ya, Lanjutkan
                    </Button>
                </div>
            </div>
        </div>
    );
};