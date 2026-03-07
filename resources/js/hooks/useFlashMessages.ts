import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

export function useFlashMessages() {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const errors = props.errors as Record<string, string>;

    // Gunakan ref untuk mencatat pesan terakhir agar tidak muncul berulang pada re-render
    const lastMessageRef = useRef<string | null>(null);

    useEffect(() => {
        const successMsg = flash?.success;
        const errorMsg = flash?.error;

        // 1. Tangani Success
        if (successMsg && lastMessageRef.current !== successMsg) {
            toast.success(successMsg);
            lastMessageRef.current = successMsg;
        }

        // 2. Tangani Error Session (bukan validasi)
        if (errorMsg && lastMessageRef.current !== errorMsg) {
            toast.error(errorMsg);
            lastMessageRef.current = errorMsg;
        }

        // 3. TENTANG VALIDASI ERRORS:
        // Saran: JANGAN gunakan toast untuk error validasi jika sudah ada <InputError />
        // Tapi jika tetap ingin, pastikan logic-nya terpisah atau batasi jumlahnya.
        /* if (Object.keys(errors).length > 0) {
             // Biarkan InputError yang bekerja di form agar tidak berisik (noise)
        } 
        */

        // Cleanup: Reset ref jika flash dikosongkan oleh server
        if (!successMsg && !errorMsg) {
            lastMessageRef.current = null;
        }

    }, [flash, errors]);
}