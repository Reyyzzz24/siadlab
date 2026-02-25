import { XMarkIcon } from "@heroicons/react/24/outline";

export const BuktiTransferModal = ({ isOpen, onClose, imageSrc }: any) => {
    if (!isOpen) return null;

    return (
        /* Overlay hitam flat tanpa blur/vignette */
        <div 
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200" 
            onClick={onClose}
        >
            <div 
                className="relative max-w-4xl w-full flex flex-col items-center" 
                onClick={e => e.stopPropagation()}
            >
                {/* Tombol Close Minimalis */}
                <button
                    className="absolute -top-12 right-0 p-1 text-white/70 hover:text-white transition-colors"
                    onClick={onClose}
                >
                    <XMarkIcon className="w-9 h-9" />
                </button>
                
                {/* Kontainer Gambar Tanpa Border/Shadow Berat */}
                <div className="w-full bg-transparent overflow-hidden rounded-lg">
                    <img
                        src={imageSrc?.startsWith('http') ? imageSrc : `/storage/${imageSrc}`}
                        alt="Bukti Transfer"
                        className="w-full h-auto max-h-[85vh] object-contain block mx-auto"
                    />
                </div>
                
                {/* Petunjuk Text Tipis */}
                <p className="mt-4 text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Ketuk di luar gambar untuk kembali
                </p>
            </div>
        </div>
    );
};