import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TrashIcon } from 'lucide-react';

interface ConfirmDeleteModalProps {
    title?: string;
    description?: string;
    selectedCount: number;
    onConfirm: () => void;
    isLoading?: boolean;
}

export const ConfirmDeleteModal = ({
    title = "Apakah Anda sangat yakin?",
    description,
    selectedCount,
    onConfirm,
    isLoading = false
}: ConfirmDeleteModalProps) => {
    
    if (selectedCount === 0) return null;

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Hapus ({selectedCount})
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description || `Tindakan ini tidak dapat dibatalkan. Ini akan menghapus secara permanen ${selectedCount} data yang dipilih dari server.`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isLoading}
                    >
                        {isLoading ? "Menghapus..." : "Ya, Hapus Semua"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};