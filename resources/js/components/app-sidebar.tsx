import { Link, usePage } from '@inertiajs/react';
import {
    Squares2X2Icon,
    WalletIcon,
    AcademicCapIcon,
    DocumentTextIcon,
    CreditCardIcon,
    UsersIcon,
    BookOpenIcon,
    FolderIcon,
    ArchiveBoxIcon,
    BeakerIcon,
    InboxIcon,
    PaperAirplaneIcon,
    ClockIcon,
    HomeIcon,
    FingerPrintIcon
} from '@heroicons/react/24/outline';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import AppLogo from './app-logo';
import { ShieldCheckIcon } from 'lucide-react';

export function AppSidebar() {
    const { url, props } = usePage() as any;
    const currentUrl = url.toLowerCase();
    const auth = props?.auth;
    const role = auth?.user?.role;
    const isAllowedRole = ['admin', 'petugas'].includes(role);

    // 1. Menu Layanan Payment
    const paymentNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/payment/dashboard', icon: Squares2X2Icon },
        { title: 'Keuangan', href: '/payment/finance', icon: WalletIcon },
        { title: 'Tagihan', href: '/payment/invoice', icon: DocumentTextIcon },
        { title: 'Bayar Sekarang', href: '/payment/pay', icon: CreditCardIcon },
        { title: 'Validasi Pembayaran', href: '/payment/list', icon: DocumentTextIcon },
        { title: 'Riwayat Pembayaran', href: '/payment/history', icon: ClockIcon },
        { title: 'SPP', href: '/payment/tuition', icon: AcademicCapIcon },
    ];

    // 2. Menu Layanan Item Lending
    const itemLendingNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/item-lending/dashboard', icon: Squares2X2Icon },
        { title: 'Katalog Barang', href: '/item-lending/items', icon: ArchiveBoxIcon },
        { title: 'Pinjam Barang', href: '/item-lending/lend', icon: FolderIcon },
        { title: 'Validasi Pinjam', href: '/item-lending/list', icon: DocumentTextIcon },
        { title: 'Riwayat Pinjam', href: '/item-lending/history', icon: ClockIcon },
    ];

    // 3. Menu Layanan Lab Lending
    const labLendingNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/lab-lending/dashboard', icon: Squares2X2Icon },
        { title: 'Daftar Lab', href: '/lab-lending/laboratories', icon: BeakerIcon },
        { title: 'Validasi Pinjam', href: '/lab-lending/list', icon: DocumentTextIcon },
        { title: 'Booking Lab', href: '/lab-lending/lend', icon: BeakerIcon },
        { title: 'Riwayat', href: '/lab-lending/history', icon: ClockIcon },
    ];

    // 4. Menu Mail Archive
    const mailArchiveNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/mail-archive/dashboard', icon: Squares2X2Icon },
        { title: 'Surat Masuk', href: '/mail-archive/incoming', icon: InboxIcon },
        { title: 'Surat Keluar', href: '/mail-archive/outgoing', icon: PaperAirplaneIcon },
    ];

    // LOGIKA PENENTUAN MENU
    let currentMainSafe: NavItem[] = [];
    let headerLink: string = '/';
    let isSubService = false;

    if (currentUrl.startsWith('/payment')) {
        currentMainSafe = isAllowedRole
            ? paymentNavItems
            : paymentNavItems.filter(i => !['/payment/invoice','/payment/finance', '/payment/list', '/payment/tuition'].includes(String(i.href)));
        headerLink = '/payment/dashboard';
        isSubService = true;
    } 
    else if (currentUrl.startsWith('/item-lending')) {
        currentMainSafe = isAllowedRole ? itemLendingNavItems : itemLendingNavItems.filter(i => i.href !== '/item-lending/list');
        headerLink = '/item-lending/dashboard';
        isSubService = true;
    } 
    else if (currentUrl.startsWith('/lab-lending')) {
        currentMainSafe = isAllowedRole ? labLendingNavItems : labLendingNavItems.filter(i => i.href !== '/lab-lending/list');
        headerLink = '/lab-lending/dashboard';
        isSubService = true;
    } 
    else if (currentUrl.startsWith('/mail-archive')) {
        currentMainSafe = mailArchiveNavItems;
        headerLink = '/mail-archive/dashboard';
        isSubService = true;
    } 
    else {
        // MENU SAAT DI DASHBOARD UTAMA ATAU SETTINGS
        currentMainSafe = [
            { title: 'Dashboard Utama', href: '/', icon: Squares2X2Icon },
            { title: 'Edit Profil', href: '/settings/profile', icon: UsersIcon },
        ];

        // Tambahkan Menu Manajemen HANYA di sini (tidak muncul saat buka layanan)
        if (isAllowedRole) {
            currentMainSafe.push({
                title: 'Data Mahasiswa',
                href: route('students.index'),
                icon: AcademicCapIcon
            });
        }
        if (role === 'admin') {
            currentMainSafe.push(
                { title: 'Data Staff', href: route('staff.index'), icon: UsersIcon },
                { title: 'Administrators', href: route('admins.index'), icon: FingerPrintIcon },
                { title: 'Manajemen Role', href: route('role.users'), icon: ShieldCheckIcon }
            );
        }
        headerLink = '/';
    }

    const footerNavItems: NavItem[] = [
        ...(isSubService ? [{ title: 'Dashboard Utama', href: '/', icon: HomeIcon }] : [])
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={String(headerLink)} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={currentMainSafe} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}