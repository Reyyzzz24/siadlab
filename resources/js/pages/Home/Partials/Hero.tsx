import React from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { motion, Variants } from 'framer-motion';

const Hero: React.FC = () => {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        },
    };

    return (
        <section id="hero" className="relative overflow-hidden mb-20">
            <div className="relative isolate px-6 lg:px-8 min-h-[55vh] sm:min-h-[45vh] lg:min-h-[85vh] flex items-stretch">

                {/* Background Image & Overlay */}
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src="/images/bg.png"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    {/* Overlay ini yang memberikan efek gelap agar teks terbaca */}
                    <div className="absolute inset-0 bg-gray-900/60"></div>
                </motion.div>

                {/* Bagian SVG Grid sudah dihapus dari sini */}

                <div className="relative z-10 mx-auto max-w-7xl flex items-center pt-[5rem] pb-20 w-full">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center w-full">

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-8 lg:text-left"
                        >
                            <motion.span
                                variants={itemVariants}
                                className="inline-block rounded-full bg-blue-500/10 text-blue-300 border border-blue-500 px-4 py-1 font-semibold mb-6 shadow-lg shadow-blue-500/10"
                            >
                                Selamat Datang di Situs Web
                            </motion.span>

                            <motion.h1
                                variants={itemVariants}
                                className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight text-white mb-4 leading-tight"
                            >
                                Tata Usaha dan <br className="hidden lg:block" />
                                <span className="text-yellow-400 drop-shadow-lg">Laboratorium</span>
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="mt-4 text-gray-200 text-lg"
                            >
                                Pusat informasi terpadu untuk administrasi, sarana prasarana, serta kegiatan akademik dan praktikum.
                            </motion.p>

                            <motion.div
                                variants={itemVariants}
                                className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4"
                            >
                                <ScrollLink
                                    to="event"
                                    smooth={true}
                                    duration={800}
                                    offset={-80}
                                    className="rounded-full px-6 py-3 text-base font-semibold bg-yellow-400 text-gray-900 shadow-xl hover:bg-yellow-500 transition-all cursor-pointer active:scale-95"
                                >
                                    Lihat Event Terbaru
                                </ScrollLink>

                                <ScrollLink
                                    to="about"
                                    smooth={true}
                                    duration={800}
                                    offset={-80}
                                    className="rounded-full px-6 py-3 text-base font-semibold text-white ring-2 ring-white/50 hover:ring-white transition-all duration-300 cursor-pointer flex items-center gap-2 active:scale-95"
                                >
                                    Pelajari Lebih Lanjut <span aria-hidden="true">→</span>
                                </ScrollLink>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;