import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import { motion, Variants } from 'framer-motion';

interface ServiceItem {
    route: string;
    name: string;
    restricted: boolean;
    icon: React.ReactNode;
}

const Services: React.FC = () => {
    const { auth } = usePage<SharedData>().props;

    const headerVariants: Variants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const services: ServiceItem[] = [
        {
            route: 'payment.dashboard',
            name: 'Pembayaran',
            restricted: false,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            route: 'item-lending.dashboard',
            name: 'Peminjaman Barang',
            restricted: false,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                </svg>
            ),
        },
        {
            route: 'mail-archive.dashboard',
            name: 'Arsip Surat',
            restricted: true,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18v14H3V7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9 6 9-6" />
                </svg>
            ),
        },
        {
            route: 'lab-lending.dashboard',
            name: 'Peminjaman Laboratorium',
            restricted: false,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
            ),
        },
    ];

    return (
        <section className="container mx-auto px-6 max-w-6xl pb-9 pt-16">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={headerVariants}
                className="text-center mb-16"
            >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors">
                    Layanan Kami
                </h2>
                <div className="h-1.5 w-20 bg-cyan-500 mx-auto rounded-full shadow-sm shadow-cyan-500/50"></div>
                <p className="mt-8 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto transition-colors">
                    Solusi yang Disesuaikan untuk Keberhasilan Anda. Kami Menyediakan Layanan Tata Usaha dan Laboratorium yang Lengkap dan Modern.
                </p>
            </motion.div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={containerVariants}
                className="flex flex-wrap justify-center gap-6 mb-12"
            >
                {services.map((service, index) => {
                    const userRole = auth?.user?.role || '';
                    const canAccess = !service.restricted || ['admin', 'petugas'].includes(userRole);

                    if (!canAccess) return null;

                    return (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            // --- PENAMBAHAN EFEK BOUNCY DI SINI ---
                            whileHover={{
                                scale: 1.05,
                                y: -10
                            }}
                            whileTap={{ scale: 0.95 }}
                            transition={{
                                /*  type: "spring",  */
                                stiffness: 400,
                                damping: 10
                            }}
                            className="w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.5rem)] min-w-[250px]"
                        >
                            <Link
                                href={auth?.user ? route(service.route) : route('login')}
                                className="bg-gradient-to-tr from-cyan-500 to-cyan-400 dark:from-cyan-600 dark:to-cyan-500 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer 
                                                transition-all duration-300 shadow-md 
                                           border border-cyan-500/50 dark:border-cyan-400/30 group h-full block"
                            >
                                <div className="p-6 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-lg group-hover:scale-110 group-hover:bg-white/30 transition-transform duration-300">
                                    {service.icon}
                                </div>
                                <p className="text-center text-base sm:text-lg font-bold text-white drop-shadow-sm mt-2">
                                    {service.name}
                                </p>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </section>
    );
};

export default Services;