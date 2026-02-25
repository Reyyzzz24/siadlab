import React from 'react';
import { X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventDetailProps {
    event: any;
    onClose: () => void;
}

export const EventDetailContent = ({ event, onClose }: EventDetailProps) => (
    <>
        <div className="relative h-64 md:h-80">
            <img
                src={event.poster ? `/storage/${event.poster}` : '/images/Placeholder_Image.webp'}
                alt={event.judul}
                className="w-full h-full object-cover"
            />
        </div>

        <div className="p-8">
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(event.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                </span>
                {event.status === 'draft' && (
                    <span className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase">
                        Draft Mode
                    </span>
                )}
            </div>

            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">{event.judul}</h3>

            <div className="prose prose-blue max-w-none text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                <p className="whitespace-pre-line">{event.deskripsi}</p>
            </div>

            <div className="border-t dark:border-gray-800 pt-6 flex justify-end">
                <Button onClick={onClose} variant="outline" className="px-8">
                    Tutup
                </Button>
            </div>
        </div>
    </>
);