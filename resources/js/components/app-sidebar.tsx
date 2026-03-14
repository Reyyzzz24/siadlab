import { Link, usePage } from '@inertiajs/react';
import {
    Squares2X2Icon,
    WalletIcon,
    AcademicCapIcon,
    DocumentTextIcon,
    CreditCardIcon,
    UsersIcon,
    ArchiveBoxIcon,
    FolderIcon,
    BeakerIcon,
    InboxIcon,
    PaperAirplaneIcon,
    ClockIcon,
    HomeIcon,
    FingerPrintIcon,
    CalendarIcon,
    TagIcon,
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
import { Settings, ShieldCheckIcon, LayoutDashboard } from 'lucide-react';

export function AppSidebar() {
    const { url, props } = usePage() as any;
    const currentUrl = url.toLowerCase();
    const auth = props?.auth;
    const role = auth?.user?.role;
    const isAllowedRole = ['admin', 'petugas'].includes(role);

    // 1. Menu Layanan (Tetap sama)
    const paymentNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/payment/dashboard', icon: Squares2X2Icon },
        { title: 'Keuangan', href: '/payment/finance', icon: WalletIcon },
        { title: 'Tagihan', href: '/payment/invoice', icon: DocumentTextIcon },
        { title: 'Bayar Sekarang', href: '/payment/pay', icon: CreditCardIcon },
        { title: 'Validasi Pembayaran', href: '/payment/list', icon: DocumentTextIcon },
        { title: 'Riwayat Pembayaran', href: '/payment/history', icon: ClockIcon },
        { title: 'Biaya Akademik', href: '/payment/tuition', icon: AcademicCapIcon },
    ];

    const itemLendingNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/item-lending/dashboard', icon: Squares2X2Icon },
        { title: 'Katalog Barang', href: '/item-lending/items', icon: ArchiveBoxIcon },
        { title: 'Pinjam Barang', href: '/item-lending/lend', icon: FolderIcon },
        { title: 'Validasi Pinjam', href: '/item-lending/list', icon: DocumentTextIcon },
        { title: 'Riwayat Pinjam', href: '/item-lending/history', icon: ClockIcon },
    ];

    const labLendingNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/lab-lending/dashboard', icon: Squares2X2Icon },
        { title: 'Daftar Lab', href: '/lab-lending/laboratories', icon: BeakerIcon },
        { title: 'Validasi Pinjam', href: '/lab-lending/list', icon: DocumentTextIcon },
        { title: 'Booking Lab', href: '/lab-lending/lend', icon: BeakerIcon },
        { title: 'Riwayat', href: '/lab-lending/history', icon: ClockIcon },
    ];

    const mailArchiveNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/mail-archive/dashboard', icon: Squares2X2Icon },
        { title: 'Surat Masuk', href: '/mail-archive/incoming', icon: InboxIcon },
        { title: 'Surat Keluar', href: '/mail-archive/outgoing', icon: PaperAirplaneIcon },
    ];

    // LOGIKA PENENTUAN MENU
    let headerLink: string = '/';
    let isSubService = false;

    let adminHomeItems: NavItem[] = [];
    let adminMasterItems: NavItem[] = [];
    let currentMainSafe: NavItem[] = []; // Untuk layanan lain (payment, dll)

    if (currentUrl.startsWith('/payment')) {
        currentMainSafe = isAllowedRole ? paymentNavItems : paymentNavItems.filter(i => !['/payment/invoice', '/payment/finance', '/payment/list', '/payment/tuition'].includes(String(i.href)));
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
    else if (currentUrl.startsWith('/admin')) {
        headerLink = '/admin';
        isSubService = true;

        // Grup 1: Home
        adminHomeItems = [
            { title: 'Dashboard', href: '/admin/dashboard', icon: Squares2X2Icon },
            { title: 'Events', href: route('admin.home.events'), icon: CalendarIcon },
            { title: 'Navbars', href: route('admin.home.navbars'), icon: LayoutDashboard },
            { title: 'Hero Sections', href: route('admin.home.hero-sections'), icon: TagIcon }
        ];

        // Grup 2: Data Master
        if (isAllowedRole) {
            adminMasterItems.push({ title: 'Data Mahasiswa', href: route('students.index'), icon: AcademicCapIcon });
        }
        if (role === 'admin') {
            adminMasterItems.push(
                { title: 'Data Staff', href: route('staff.index'), icon: UsersIcon },
                { title: 'Administrators', href: route('admins.index'), icon: FingerPrintIcon },
                { title: 'Manajemen Role', href: route('role.users'), icon: ShieldCheckIcon }
            );
        }
    } else {
        currentMainSafe = [
            { title: 'Dashboard Utama', href: '/', icon: Squares2X2Icon },
            { title: 'Settings', href: '/settings/profile', icon: Settings },
        ];
        if (isAllowedRole) {
            currentMainSafe.push({ title: 'Admin Panel', href: '/admin/dashboard', icon: ShieldCheckIcon });
        }
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
                            <Link href={headerLink} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {currentUrl.startsWith('/admin') ? (
                    <>
                        <NavMain label="Home" items={adminHomeItems} />
                        {adminMasterItems.length > 0 && <NavMain label="Data Master" items={adminMasterItems} />}
                    </>
                ) : (
                    <>
                        {/* Gunakan currentMainSafe untuk semua layanan */}
                        {currentUrl.startsWith('/payment') && (
                            <NavMain label="Layanan Pembayaran" items={currentMainSafe} />
                        )}
                        {currentUrl.startsWith('/item-lending') && (
                            <NavMain label="Layanan Peminjaman Barang" items={currentMainSafe} />
                        )}
                        {currentUrl.startsWith('/lab-lending') && (
                            <NavMain label="Layanan Peminjaman Lab" items={currentMainSafe} />
                        )}
                        {currentUrl.startsWith('/mail-archive') && (
                            <NavMain label="Layanan Arsip Surat" items={currentMainSafe} />
                        )}

                        {/* Untuk Dashboard Utama */}
                        {!['/payment', '/item-lending', '/lab-lending', '/mail-archive'].some(path => currentUrl.startsWith(path)) && (
                            <NavMain label="Menu Utama" items={currentMainSafe} />
                        )}
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}