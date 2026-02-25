import React from 'react';
import { Button } from "@/components/ui/button";
export const NoteDetailModal = ({ isOpen, onClose, note }: any) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                    Catatan Transaksi
                </h3>
                
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-700 dark:text-slate-300 italic text-sm leading-relaxed">
                        {note ? `"${note}"` : "Tidak ada catatan untuk transaksi ini."}
                    </p>
                </div>

                <Button 
                    className="mt-8 w-full h-12 transition-all active:scale-95" 
                    onClick={onClose}
                >
                    Tutup Detail
                </Button>
            </div>
        </div>
    );
};