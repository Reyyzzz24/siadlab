// components/Finance/FinanceStats.tsx
import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    color: 'blue' | 'red' | 'green' | 'yellow';
    label: string;
    value: string;
}

const StatCard = ({ icon, color, label, value }: StatCardProps) => {
    const bgColors = {
        blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${bgColors[color]}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">{icon}</g>
                </svg>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">{label}</p>
            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    );
};

export const FinanceStats = ({ saldo, konfirmasi, lunas, tunggakan }: any) => (
    <div className="grid grid-cols-1 py-5 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard color="blue" label="Total Saldo Kas" value={saldo} icon={<path d="M12 8c-4 0-8 1-8 5s4 5 8 5 8-1 8-5-4-5-8-5zM12 12v.01" />} />
        <StatCard color="red" label="Menunggu Konfirmasi" value={konfirmasi} icon={<path d="M3 17l6-6 4 4 8-8" />} />
        <StatCard color="green" label="Tagihan Lunas" value={lunas} icon={<path d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V7a2 2 0 012-2h3l2-2 2 2h3a2 2 0 012 2v11a2 2 0 01-2 2z" />} />
        <StatCard color="yellow" label="Mahasiswa Menunggak" value={tunggakan} icon={<path d="M5.121 17.804A13.944 13.944 0 0112 15c2.5 0 4.847.614 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />} />
    </div>
);