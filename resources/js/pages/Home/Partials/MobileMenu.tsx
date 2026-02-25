import React, { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Link as ScrollLink } from 'react-scroll';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    User as UserIcon,
    LogOut,
    CreditCard,
    Package,
    Archive,
    FlaskConical,
    X
} from 'lucide-react';

interface MobileMenuProps {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    isLayananOpen: boolean;
    setIsLayananOpen: (val: boolean) => void;
    isUserMenuOpen: boolean;
    setIsUserMenuOpen: (val: boolean) => void;
    auth: any;
    logout: (e: React.FormEvent) => void;
    openProfile: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
    isOpen, setIsOpen,
    isLayananOpen, setIsLayananOpen,
    isUserMenuOpen, setIsUserMenuOpen,
    auth, logout, openProfile
}) => {

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Reset overflow saat unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* 1. Backdrop Overlay - Menghilangkan kesan transparan kosong */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 z-[80] lg:hidden"
                    />

                    {/* 2. Main Canvas Panel */}
                    <motion.div
                        initial={{ x: '100%' }} // Mulai benar-benar dari luar layar
                        animate={{ x: 0 }}      // Meluncur masuk
                        exit={{ x: '100%' }}    // Meluncur keluar saat ditutup
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 w-72 h-screen bg-white dark:bg-slate-900 z-[90] flex flex-col p-6 pt-24 space-y-4 shadow-2xl lg:hidden overflow-y-auto"
                    >

                        <nav className="flex flex-col space-y-1">
                            <ScrollLink
                                to="hero"
                                smooth={true}
                                duration={800}
                                offset={-80}
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hover:bg-cyan-50 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-xl cursor-pointer block"
                            >
                                Beranda
                            </ScrollLink>

                            <ScrollLink
                                to="about"
                                smooth={true}
                                duration={800}
                                offset={-80}
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hover:bg-cyan-50 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-xl cursor-pointer block"
                            >
                                Tentang Kami
                            </ScrollLink>

                            {/* Layanan Dropdown Mobile */}
                            <div className="flex flex-col">
                                <button
                                    onClick={() => setIsLayananOpen(!isLayananOpen)}
                                    className="flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hover:bg-cyan-50 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    <span>Layanan</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLayananOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <motion.div
                                    initial={false}
                                    animate={{ height: isLayananOpen ? 'auto' : 0, opacity: isLayananOpen ? 1 : 0 }}
                                    className="pl-6 flex flex-col space-y-1 border-l-2 border-cyan-100 dark:border-slate-700 ml-4 overflow-hidden"
                                >
                                    <Link href={route('payment.dashboard')} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-600">
                                        <CreditCard size={14} /> Pembayaran
                                    </Link>
                                    <Link href={route('item-lending.dashboard')} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-600">
                                        <Package size={14} /> Peminjaman Barang
                                    </Link>
                                    {auth?.user && ['admin', 'petugas'].includes(auth.user.role) && (
                                        <Link href={route('mail-archive.dashboard')} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-600">
                                            <Archive size={14} /> Arsip Surat
                                        </Link>
                                    )}
                                    <Link href={route('lab-lending.dashboard')} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-600">
                                        <FlaskConical size={14} /> Peminjaman Lab
                                    </Link>
                                </motion.div>
                            </div>

                            <ScrollLink
                                to="contact"
                                smooth={true}
                                duration={800}
                                offset={-80}
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hover:bg-cyan-50 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-xl cursor-pointer block"
                            >
                                Kontak Kami
                            </ScrollLink>
                        </nav>

                        <hr className="border-gray-100 dark:border-slate-800 my-4" />

                        {/* User Section Mobile */}
                        <div className="px-4">
                            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Profil Anda</p>
                            {auth?.user ? (
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 transition-all"
                                    >
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=22d3ee&color=fff`}
                                            className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-600 shadow-sm"
                                            alt="Profile"
                                        />
                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-bold text-gray-800 dark:text-white truncate w-28">{auth.user.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-slate-400 uppercase">{auth.user.role}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 ml-auto text-gray-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <motion.div
                                        initial={false}
                                        animate={{ height: isUserMenuOpen ? 'auto' : 0, opacity: isUserMenuOpen ? 1 : 0 }}
                                        className="bg-white dark:bg-slate-800 rounded-xl flex flex-col overflow-hidden border border-gray-50 dark:border-slate-700"
                                    >
                                        <button onClick={openProfile} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-cyan-50 dark:hover:bg-slate-700 hover:text-cyan-600">
                                            <UserIcon className="w-4 h-4" /> Profile Settings
                                        </button>
                                        <form onSubmit={logout}>
                                            <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                <LogOut className="w-4 h-4" /> Logout
                                            </button>
                                        </form>
                                    </motion.div>
                                </div>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="flex items-center justify-center bg-cyan-600 dark:bg-cyan-700 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-cyan-700 transition active:scale-95"
                                >
                                    Login ke SIADLAB
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileMenu;