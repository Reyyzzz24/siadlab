import React, { useState, useEffect, useRef } from 'react';
import { Landmark, Rocket } from 'lucide-react';
import { motion, AnimatePresence, useInView, useSpring, useTransform } from 'framer-motion';

const images = [
    "/images/picture1.webp",
    "/images/picture2.webp",
    "/images/picture3.webp"
];

// --- Sub-komponen untuk Angka Berhitung ---
const Counter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    // Spring physics untuk pergerakan angka yang smooth
    const springValue = useSpring(0, {
        stiffness: 100,
        damping: 30,
        duration: 2000,
    });

    const displayValue = useTransform(springValue, (current) =>
        Math.round(current).toLocaleString()
    );

    useEffect(() => {
        if (isInView) {
            springValue.set(value);
        }
    }, [isInView, value, springValue]);

    return (
        <span ref={ref}>
            <motion.span>{displayValue}</motion.span>
            {suffix}
        </span>
    );
};

const About: React.FC = () => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [loadedImages, setLoadedImages] = useState<number[]>([0]);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => {
                const next = prev === images.length - 1 ? 0 : prev + 1;
                setLoadedImages(currentLoaded =>
                    currentLoaded.includes(next) ? currentLoaded : [...currentLoaded, next]
                );
                return next;
            });
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleManualChange = (index: number) => {
        setLoadedImages(currentLoaded =>
            currentLoaded.includes(index) ? currentLoaded : [...currentLoaded, index]
        );
        setActiveSlide(index);
    };

    return (
        <section id="about" className="py-24 bg-white dark:bg-background overflow-hidden transition-colors duration-500">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-16 items-start">

                    {/* Kolom Kiri: Slideshow Gambar */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-1/2 lg:sticky lg:top-10"
                    >
                        <div className="relative group">
                            <div className="absolute -bottom-6 -right-6 w-full h-full bg-cyan-100 dark:bg-cyan-900/20 rounded-3xl -z-10 group-hover:-bottom-4 group-hover:-right-4 transition-all duration-500"></div>

                            <div className="overflow-hidden rounded-3xl shadow-2xl border-8 border-white dark:border-zinc-900 relative h-[400px] md:h-[500px] transition-colors bg-gray-100 dark:bg-zinc-800">
                                <AnimatePresence>
                                    <motion.div
                                        key={activeSlide}
                                        initial={{ opacity: 0, scale: 1.1 }} // Zoom-in awal
                                        animate={{ opacity: 1, scale: 1 }}    // Menuju normal
                                        exit={{ opacity: 0 }}               // Fade out halus tanpa zoom agar tidak "nabrak"
                                        transition={{
                                            duration: 1.2,                   // Durasi lebih lama agar 'blend' terasa
                                            ease: [0.4, 0, 0.2, 1]           // Cubic bezier untuk gerakan premium
                                        }}
                                        className="absolute inset-0 z-0"
                                        style={{ backfaceVisibility: 'hidden' }} // Mencegah kedipan di Chrome/Safari
                                    >
                                        {loadedImages.includes(activeSlide) && (
                                            <img
                                                src={images[activeSlide]}
                                                className="w-full h-full object-cover shadow-2xl"
                                                alt={`Slide ${activeSlide}`}
                                            />
                                        )}

                                        {/* Overlay tipis opsional agar blend lebih dramatis */}
                                        <div className="absolute inset-0 bg-black/10" />
                                    </motion.div>
                                </AnimatePresence>

                                <div className="absolute bottom-6 right-6 flex gap-2 z-20">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleManualChange(index)}
                                            className={`h-2 rounded-full transition-all duration-500 ${activeSlide === index ? 'w-8 bg-cyan-500' : 'w-2 bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Accreditation Badge */}
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="absolute -bottom-4 left-10 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 hidden md:block z-30"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-cyan-500 p-3 rounded-lg text-white shadow-lg shadow-cyan-500/20">
                                        <Landmark size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-zinc-500 font-bold uppercase tracking-widest">Akreditasi</p>
                                        <p className="text-xl font-black text-gray-800 dark:text-zinc-100 tracking-tight">Peringkat BAIK</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Kolom Kanan: Teks Konten */}
                    <div className="w-full lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-10"
                        >
                            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-black tracking-widest text-cyan-600 dark:text-cyan-400 uppercase bg-cyan-50 dark:bg-cyan-900/30 rounded-full">
                                Profil Fakultas
                            </span>
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                                Tentang <span className="text-cyan-600 dark:text-cyan-400">Kami</span>
                            </h2>
                            <div className="h-1.5 w-20 bg-cyan-500 rounded-full"></div>
                            <p className="mt-8 text-xl font-bold text-gray-800 dark:text-zinc-200 leading-relaxed">
                                Fakultas Ilmu Komputer (FILKOM) <br />
                                <span className="text-cyan-600 dark:text-cyan-400">Universitas Djuanda</span>
                            </p>
                        </motion.div>

                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="prose prose-lg text-gray-600 dark:text-zinc-400 leading-relaxed"
                            >
                                <p>
                                    Fakultas Ilmu Komputer (FILKOM) memiliki satu program studi, yaitu Ilmu Komputer.
                                    Pembukaan Program Studi Ilmu Komputer didasarkan pada surat Nomor <span className="font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-1 rounded">9210/E1/TP.01.06/2021</span>.
                                </p>
                            </motion.div>

                            {/* Statistik dengan Angka Berhitung */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    className="bg-gradient-to-br from-cyan-500 to-cyan-700 p-6 rounded-2xl text-white shadow-xl"
                                >
                                    <div className="text-4xl font-black mb-1">
                                        <Counter value={414} suffix="%" />
                                    </div>
                                    <div className="text-xs font-bold opacity-80 uppercase tracking-tighter">Kenaikan Mahasiswa</div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm"
                                >
                                    <div className="text-4xl font-black text-gray-800 dark:text-zinc-100 mb-1">
                                        <Counter value={58} />
                                    </div>
                                    <div className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-tighter">Mhs (2022/2023)</div>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-zinc-900/30 border-l-8 border-cyan-500 p-8 rounded-r-3xl shadow-md"
                            >
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-4 flex items-center gap-3">
                                    <Rocket className="text-cyan-500 animate-pulse" />
                                    Era Baru: Fakultas Mandiri
                                </h3>
                                <p className="text-gray-600 dark:text-zinc-300 leading-relaxed italic border-b border-gray-100 dark:border-zinc-800 pb-4 mb-4">
                                    "Pada hari Senin, 4 September 2023, program studi ilmu komputer resmi berdiri sendiri sebagai Fakultas Ilmu Komputer."
                                </p>
                                <p className="text-gray-500 dark:text-zinc-500 text-sm">
                                    Penetapan ini ditandai dengan peresmian struktur fakultas di Aula Gedung C.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;