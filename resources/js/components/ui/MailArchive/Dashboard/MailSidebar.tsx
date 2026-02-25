import { Link } from '@inertiajs/react';

export const MailSidebar = ({ roleLabel, user, suratTerbaru }: any) => (
    <div className="w-full lg:w-80 lg:shrink-0 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-100 dark:border-gray-700">
            <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">{roleLabel}</p>
            <p className="text-sm text-gray-700 dark:text-gray-400 truncate">{user?.email || 'admin@gmail.com'}</p>
            {(user?.nama || user?.name) && (
                <p className="text-xs text-gray-500 mt-1 truncate">{user?.nama || user?.name}</p>
            )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-100 dark:border-gray-700">
            <p className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Surat Masuk Terbaru</p>
            {suratTerbaru ? (
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-6">
                    <p className="font-bold text-blue-600 dark:text-blue-400">No: {suratTerbaru.no_surat}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1 line-clamp-2">
                        "{suratTerbaru.perihal}"
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2">
                        Diterima: {new Date(suratTerbaru.tanggal_terima).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic mb-6">Belum ada data.</p>
            )}
            <Link
                href={route('mail-archive.dashboard')}
                className="inline-block w-full text-center text-blue-700 dark:text-blue-400 border border-blue-700 dark:border-blue-400 rounded px-4 py-2 text-sm hover:bg-blue-700 dark:hover:bg-blue-400 hover:text-white dark:hover:text-gray-900 transition font-medium"
            >
                Lihat Semua Arsip
            </Link>
        </div>
    </div>
);