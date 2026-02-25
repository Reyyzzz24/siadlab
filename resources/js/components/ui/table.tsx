import React from 'react';

// Container Utama Tabel
export const Table = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-800 dark:text-gray-100 border-collapse">
                {children}
            </table>
        </div>
    </div>
);

// Header Tabel - SEKARANG HANYA MERENDER <thead>
export const Thead = ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        {children}
    </thead>
);

// Body Tabel
export const Tbody = ({ children }: { children: React.ReactNode }) => (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
        {children}
    </tbody>
);

// Baris Tabel (Row)
export const Tr = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <tr className={`border-b border-gray-200 dark:border-gray-800 last:border-none hover:bg-gray-100 dark:hover:bg-gray-800/40 transition-colors ${className}`}>
        {children}
    </tr>
);

interface CellProps {
    children?: React.ReactNode;
    className?: string;
    center?: boolean;
    isCheckbox?: boolean;
    colSpan?: number;
    onClick?: () => void; // TAMBAHKAN INI
}

// Cell Header (Th)
export const Th = ({ children, className = "", center = false, isCheckbox = false }: CellProps) => (
    <th className={`py-3 px-3 font-bold ${isCheckbox ? 'w-10' : ''} ${center ? 'text-center' : 'text-left'} ${className}`}>
        {children}
    </th>
);

// Cell Data (Td)
export const Td = ({ children, className = "", center = false, colSpan, onClick }: CellProps) => (
    <td 
        colSpan={colSpan} 
        onClick={onClick}
        className={`py-3 px-3 ${center ? 'text-center' : 'text-left'} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
        {children}
    </td>
)