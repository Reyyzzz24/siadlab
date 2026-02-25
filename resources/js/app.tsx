import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { route } from 'ziggy-js'; // Import fungsi route-nya
import { Toaster } from 'sonner';

import { initializeTheme } from './hooks/use-appearance';

// Mendaftarkan Ziggy ke global window agar bisa dipanggil tanpa import di file lain
window.route = route;

const appName = import.meta.env.VITE_APP_NAME || 'SIADLAB';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            // Pastikan path ini sesuai dengan struktur folder Anda (apakah 'pages' atau 'Pages')
            `./pages/${name}.tsx`, 
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        // Inisialisasi Ziggy secara global menggunakan data dari Laravel props
        // Ini akan memperbaiki error "reading payment.dashboard"
        if (typeof window !== 'undefined') {
            (window as any).route = (name: any, params: any, absolute: any, config = props.initialPage.props.ziggy as any) => 
                route(name, params, absolute, config);
        }

        const root = createRoot(el);
        root.render(
            <StrictMode>
                <App {...props} />
                <Toaster position="top-right" richColors />
            </StrictMode>
        );
    },
    progress: {
        // Mengubah warna progress bar menjadi Cyan agar sesuai dengan tema UI Anda
        color: '#06b6d4', 
        showSpinner: true,
    },
});

// Inisialisasi tema (Dark/Light mode)
initializeTheme();