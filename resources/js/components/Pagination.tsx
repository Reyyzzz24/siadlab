import { Link } from '@inertiajs/react';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    // Terima objek meta/pagination lengkap dari Laravel
    meta: {
        current_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
}

export function Pagination({ meta }: Props) {
    const { links, from, to, total, current_page } = meta;

    if (total <= meta.per_page) return null;

    const prevLink = links[0];
    const nextLink = links[links.length - 1];
    
    // 1. Ambil semua link angka (buang prev & next)
    const allPageLinks = links.slice(1, -1);

    // 2. Logika membatasi hanya 5 angka halaman
    const maxVisiblePages = 5;
    let startPage = Math.max(0, current_page - Math.ceil(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages;

    // Pastikan jika di akhir halaman, startPage tetap menyesuaikan agar tetap tampil 5 angka
    if (endPage > allPageLinks.length) {
        endPage = allPageLinks.length;
        startPage = Math.max(0, endPage - maxVisiblePages);
    }

    const visiblePageLinks = allPageLinks.slice(startPage, endPage);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
                Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{from}</span> sampai <span className="font-semibold text-gray-900 dark:text-white">{to}</span> dari <span className="font-semibold text-gray-900 dark:text-white">{total}</span> data
            </div>

            <nav className="flex items-center gap-1">
                <Link
                    href={prevLink.url || '#'}
                    preserveScroll
                    className={`p-2 rounded-lg border transition ${
                        !prevLink.url 
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700' 
                        : 'bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>

                <div className="hidden sm:flex items-center gap-1">
                    {/* Menggunakan visiblePageLinks yang sudah dibatasi */}
                    {visiblePageLinks.map((link, key) => (
                        <Link
                            key={key}
                            href={link.url || '#'}
                            preserveScroll
                            className={`px-3.5 py-2 text-sm font-medium rounded-lg border transition ${
                                link.active
                                ? 'bg-black text-white border-black shadow-sm'
                                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>

                <Link
                    href={nextLink.url || '#'}
                    preserveScroll
                    className={`p-2 rounded-lg border transition ${
                        !nextLink.url 
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700' 
                        : 'bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                >
                    <ChevronRight className="w-5 h-5" />
                </Link>
            </nav>
        </div>
    );
}