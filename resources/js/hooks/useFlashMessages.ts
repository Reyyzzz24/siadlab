import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

export function useFlashMessages() {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const errors = props.errors as Record<string, string>; // Ambil errors validasi

    useEffect(() => {
        // 1. Menangani Flash Message (Success/Error dari session)
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }

        // 2. TAMBAHKAN INI: Menangani Error Validasi (seperti poster max)
        if (errors && Object.keys(errors).length > 0) {
            // Mengambil pesan error pertama yang ditemukan
            const firstErrorMessage = Object.values(errors)[0];
            toast.error(firstErrorMessage);
        }
    }, [flash, errors]); // Tambahkan errors ke dependency array
}