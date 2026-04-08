import React, { useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { SharedData } from '@/types';
import { Link as ScrollLink } from 'react-scroll'; // Import ScrollLink

interface NavbarItem {
    id: number;
    title: string;
    url: string;
    parent_id: number | null;
}

interface MobileMenuProps {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    auth: any;
    logout: (e: React.FormEvent) => void;
    openProfile: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, setIsOpen, auth, logout, openProfile }) => {
    const { navbars } = usePage<SharedData & { navbars: NavbarItem[] }>().props;
    const [openDropdowns, setOpenDropdowns] = React.useState<Record<number, boolean>>({});
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

    const toggleDropdown = (id: number) => {
        setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }));
    };

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Fungsi Helper untuk render link (Scroll vs Inertia)
    const renderMobileLink = (item: NavbarItem, className: string) => {
        const isAnchor = item.url.startsWith('#');

        if (isAnchor) {
            return (
                <ScrollLink
                    key={item.id}
                    to={item.url.replace('#', '')}
                    smooth={true}
                    duration={500}
                    offset={-70} // Menyesuaikan tinggi header mobile
                    onClick={() => setIsOpen(false)} // Tutup menu setelah klik
                    className={`${className} cursor-pointer`}
                >
                    {item.title}
                </ScrollLink>
            );
        }

        return (
            <Link
                key={item.id}
                href={item.url}
                onClick={() => setIsOpen(false)}
                className={className}
            >
                {item.title}
            </Link>
        );
    };

    return (
        <AnimatePresence mode="sync">
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 z-[80] lg:hidden"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 w-72 h-screen bg-white dark:bg-slate-900 z-[90] flex flex-col p-6 pt-24 shadow-2xl lg:hidden overflow-y-auto"
                    >
                        <nav className="flex flex-col space-y-1">
                            {navbars.filter(n => !n.parent_id).map((item) => {
                                const children = navbars.filter(n => n.parent_id === item.id);
                                const hasChildren = children.length > 0;

                                return (
                                    <div key={item.id} className="flex flex-col">
                                        {hasChildren ? (
                                            <button
                                                onClick={() => toggleDropdown(item.id)}
                                                className="flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hover:bg-cyan-50 dark:hover:bg-slate-800 rounded-xl"
                                            >
                                                <span>{item.title}</span>
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openDropdowns[item.id] ? 'rotate-180' : ''}`} />
                                            </button>
                                        ) : (
                                            // Render menu utama tanpa anak
                                            renderMobileLink(item, "px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hover:bg-cyan-50 dark:hover:bg-slate-800 rounded-xl block")
                                        )}

                                        {hasChildren && (
                                            <motion.div
                                                initial={false}
                                                animate={{ height: openDropdowns[item.id] ? 'auto' : 0, opacity: openDropdowns[item.id] ? 1 : 0 }}
                                                className="pl-6 flex flex-col space-y-1 border-l-2 border-cyan-100 dark:border-slate-700 ml-4 overflow-hidden"
                                            >
                                                {/* Render sub-menu */}
                                                {children.map(child => 
                                                    renderMobileLink(child, "px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-600 block")
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>

                        <hr className="border-gray-100 dark:border-slate-800 my-4" />

                        <div className="px-4">
                            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Profil Anda</p>
                            {auth?.user ? (
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 transition-all"
                                    >
                                        <div className="w-10 h-10 flex-shrink-0 rounded-full border-2 border-white dark:border-slate-600 shadow-sm overflow-hidden bg-cyan-500 aspect-square">
                                            <img
                                                src={auth.user.profile_photo_path 
                                                    ? `/storage/${auth.user.profile_photo_path}` 
                                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=22d3ee&color=fff`}
                                                className="w-full h-full object-cover"
                                                alt={auth.user.name}
                                            />
                                        </div>
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
                                            <Settings className="w-4 h-4" /> Settings
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
                                    onClick={() => setIsOpen(false)}
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