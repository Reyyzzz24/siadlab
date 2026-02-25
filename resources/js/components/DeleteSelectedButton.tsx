import React from 'react';
import { router } from '@inertiajs/react';
import { TrashIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Pastikan bagian ini sudah ada 'onClick?' dan 'routeName?'
interface DeleteSelectedButtonProps {
    selectedIds: any[];
    routeName?: string;     // Dibuat opsional dengan tanda ?
    onClick?: () => void;   // Tambahkan baris ini (opsional)
    onSuccess?: () => void;
    label?: string;
}

export const DeleteSelectedButton = ({
    selectedIds,
    routeName,
    onClick,
    onSuccess,
    label = "Hapus"
}: DeleteSelectedButtonProps) => {
    
    if (selectedIds.length === 0) return null;

    const handleDelete = () => {
        // Jika user mengirim prop onClick, jalankan fungsi tersebut
        if (onClick) {
            onClick();
            return;
        }

        // Jika tidak ada onClick, gunakan logika router default
        if (routeName && confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} item?`)) {
            router.post(route(routeName), 
                { selected_ids: selectedIds },
                {
                    onSuccess: () => onSuccess?.(),
                    preserveScroll: true,
                }
            );
        }
    };

    return (
        <Button variant="destructive" size="sm" onClick={handleDelete}>
            <TrashIcon className="w-4 h-4 mr-2" />
            {label} ({selectedIds.length})
        </Button>
    );
};