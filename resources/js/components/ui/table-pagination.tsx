import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    perPage: number;
    onPageChange: (page: number) => void;
}

export const TablePagination = ({ currentPage, totalItems, perPage, onPageChange }: PaginationProps) => {
    const totalPages = Math.ceil(totalItems / perPage);
    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalItems);

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="text-sm text-gray-700 dark:text-gray-300">
                Menampilkan <span className="font-semibold">{startItem}</span> sampai <span className="font-semibold">{endItem}</span> dari <span className="font-semibold">{totalItems}</span> hasil
            </div>
            <div className="flex gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                    Previous
                </button>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                    Next
                </button>
            </div>
        </div>
    );
};