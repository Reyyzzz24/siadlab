import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    sidebarOpen: boolean;
    auth: {
        user: User | null;
    };
    flash: Flash;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    profile_photo_path?: string; // Tambahkan ini sesuai database Laravel
    role: 'mahasiswa' | 'petugas' | 'admin' | 'user' | string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;

    // Definisikan relasi agar TypeScript mengenali propertinya
    mahasiswa?: {
        id?: number;
        nim: string;
        program_studi: string;
        kelas: string;
        no_telepon: string;
    };

    petugas?: {
        id?: number;
        no_induk: string;
        jabatan: string;
        bagian: string;
        no_telepon: string;
    };

    administrator?: {
        id?: number;
        no_induk: string;
        jabatan: string;
        bagian: string;
        no_telepon: string;
    };
}

export interface EventItem {
    id: number;
    judul: string;
    deskripsi: string;
    tanggal: string;
    poster?: string;
    status: 'draft' | 'published';
    lokasi: string;
}

export interface HeroSection {
    id: number;
    title: string;
    subtitle?: string;
    image_path?: string;
    cta_text?: string;
    cta_link?: string;
    position: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Flash {
    success?: string;
    error?: string;
}

declare global {
    // Menambahkan fungsi route ke global window agar TS mengenalinya
    function route(
        name?: string,
        params?: RouteParamsWithQueryOverload | RouteParam,
        absolute?: boolean,
        config?: Config,
    ): string;
}

declare module 'ziggy-js' {
    export function route(
        name?: string,
        params?: any,
        absolute?: boolean,
        config?: any
    ): string;
}
