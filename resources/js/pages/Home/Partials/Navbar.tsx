import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import { Link as ScrollLink } from 'react-scroll';
import {
    BookOpen,
    ChevronDown,
    Menu,
    X,
    User as UserIcon,
    LogOut,
    CreditCard,
    Package,
    Archive,
    FlaskConical,
    Settings
} from 'lucide-react';
import MobileMenu from './MobileMenu';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';

interface NavbarItem {
    id: number;
    title: string;
    url: string;
    parent_id: number | null; // Tambahkan ini
}

const Navbar: React.FC = () => {
    const { auth, url, navbars } = usePage<SharedData & { navbars: NavbarItem[] }>().props;
    const [isOpen, setIsOpen] = useState(false);
    const [isLayananOpen, setIsLayananOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const mainMenus = navbars.filter(n => !n.parent_id);
    const subMenus = navbars.filter(n => n.parent_id !== null);

    const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});

    const toggleDropdown = (id: number, isOpen: boolean) => {
        setOpenDropdowns(prev => ({ ...prev, [id]: isOpen }));
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Menutup semua menu ketika navigasi terjadi (perubahan URL)
    useEffect(() => {
        setIsOpen(false);
        setIsUserMenuOpen(false);
        setIsLayananOpen(false);
    }, [url]);

    const logout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const openProfile = () => {
        setIsOpen(false);
        setIsUserMenuOpen(false);
        router.visit(route('profile.edit'));
    };

    return (
        <header
            className={`fixed inset-x-0 top-0 z-[50] transition-all duration-300 ${scrolled
                ? 'bg-cyan-900/90 dark:bg-slate-900/95 backdrop-blur-md shadow-md'
                : 'bg-transparent'
                }`}
        >
            <nav className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto">
                {/* Logo */}
                <div className="flex lg:flex-1">
                    <Link href="/" className="flex items-center gap-2">
                        <AppLogoIcon
                            className="h-8 w-auto"
                            forceInvert={true}
                        />
                        <span className="text-xl font-bold text-white">SIADLAB</span>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="hidden lg:flex lg:gap-x-8 items-center">
                    {mainMenus.map((item) => {
                        const children = navbars.filter(n => n.parent_id === item.id);
                        const hasChildren = children.length > 0;

                        if (hasChildren) {
                            return (
                                <div
                                    key={item.id}
                                    className="relative py-2"
                                    onMouseEnter={() => toggleDropdown(item.id, true)}
                                    onMouseLeave={() => toggleDropdown(item.id, false)}
                                >
                                    <button className="text-sm font-semibold text-white flex items-center gap-1 hover:text-cyan-200">
                                        {item.title} <ChevronDown size={14} className={openDropdowns[item.id] ? 'rotate-180' : ''} />
                                    </button>

                                    {openDropdowns[item.id] && (
                                        <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl py-2 z-50 border border-gray-100 dark:border-slate-700">
                                            {children.map(child => (
                                                <Link
                                                    key={child.id}
                                                    href={child.url}
                                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-cyan-50 dark:hover:bg-slate-700"
                                                >
                                                    {child.title}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.id}
                                href={item.url}
                                className="text-sm font-semibold text-white hover:text-cyan-200 transition-colors"
                            >
                                {item.title}
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop User Menu */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-4">
                    {auth?.user ? (
                        <>
                            <span className="text-sm font-medium text-white hidden xl:block">
                                Halo, {auth.user.name}
                            </span>
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="w-9 h-9 rounded-full border border-white/40 overflow-hidden hover:scale-105 transition-transform bg-cyan-500"
                                >
                                    <img
                                        src={
                                            auth.user.profile_photo_path
                                                ? `/storage/${auth.user.profile_photo_path}`
                                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=22d3ee&color=fff`
                                        }
                                        alt={auth.user.name}
                                        className="w-full h-full object-cover"
                                    />
                                </button>

                                {isUserMenuOpen && (
                                    <>
                                        {/* Overlay untuk menutup menu saat klik di luar */}
                                        <div className="fixed inset-0 z-[-1]" onClick={() => setIsUserMenuOpen(false)}></div>
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl py-2 z-50 border border-gray-100 dark:border-slate-700">
                                            <button onClick={openProfile} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                <Settings size={16} /> Settings
                                            </button>
                                            <form onSubmit={logout}>
                                                <button type="submit" className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                                    <LogOut size={16} /> Logout
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link href={route('login')} className="text-sm font-semibold text-white hover:text-cyan-200 transition-colors">
                            Log in &rarr;
                        </Link>
                    )}
                </div>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="fixed top-4 right-4 lg:hidden flex flex-col justify-center items-center space-y-1.5 cursor-pointer z-[100] w-12 h-12 rounded-xl transition-all duration-300"
                    aria-label="Toggle Menu"
                >
                    <div className={`w-6 h-0.5 transition-all duration-300 transform origin-center ${isOpen ? 'rotate-45 translate-y-2 bg-gray-800 dark:bg-white' : 'bg-white'}`}></div>
                    <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? 'opacity-0 -translate-x-2' : 'bg-white'}`}></div>
                    <div className={`w-6 h-0.5 transition-all duration-300 transform origin-center ${isOpen ? '-rotate-45 -translate-y-2 bg-gray-800 dark:bg-white' : 'bg-white'}`}></div>
                </button>
            </nav>

            {/* Panggil Komponen Mobile Menu */}
            <MobileMenu
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                auth={auth}
                logout={logout}
                openProfile={openProfile}
            />

        </header>
    );
};

export default Navbar;