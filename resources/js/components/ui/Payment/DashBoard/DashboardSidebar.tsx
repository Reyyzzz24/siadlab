// components/Dashboard/DashboardSidebar.tsx
import { router } from '@inertiajs/react';
import { useState } from 'react'; // Pastikan diimport

export const DashboardSidebar = ({ roleLabel, user, latestMahasiswa }: any) => {
    // 1. Pindahkan state ke dalam komponen
    const [isLayananOpen, setIsLayananOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // 2. Definisikan fungsi di dalam komponen
    const openProfile = () => {
        setIsUserMenuOpen(false);
        router.get(route('profile.edit'));
    };
    return (
        <div className="w-full lg:w-80 lg:shrink-0 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-100 dark:border-gray-700">
                <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">{roleLabel}</p>
                <p className="text-sm text-gray-700 dark:text-gray-400 truncate">{user?.email}</p>
                {user?.name && <p className="text-xs text-gray-500 mt-1 truncate">{user.name}</p>}
            </div>

            {/* Latest Mahasiswa Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-100 dark:border-gray-700">
                <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Lengkapi Profil Anda</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                    Pastikan data profil Anda sudah lengkap untuk mempermudah layanan kami.
                </p>
                <button
                    onClick={openProfile}
                    className="inline-block w-full text-center text-blue-700 dark:text-blue-400 border border-blue-700 dark:border-blue-400 rounded px-4 py-2 text-sm hover:bg-blue-700 dark:hover:bg-blue-400 hover:text-white dark:hover:text-gray-900 transition font-medium"
                >
                    Lengkapi Profil
                </button>
            </div>
        </div>
    );
}