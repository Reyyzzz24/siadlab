import React from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { motion } from 'framer-motion';
import { Variants } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { HeroSection } from '@/types';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

interface HeroProps {
    heroSections: HeroSection[];
}

// Definisikan varian animasi di luar komponen agar tidak re-render
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut" as const // Gunakan "as const" untuk memastikan tipenya Easing
        }
    }
};

const Hero: React.FC<HeroProps> = ({ heroSections = [] }) => {
    return (
        <section id="hero" className="relative overflow-hidden mb-20 min-h-[85vh] bg-gray-900">
            <Swiper
                key={heroSections.length}
                modules={[Autoplay, EffectFade, Pagination]}
                effect="fade"
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                className="h-full w-full"
            >
                {heroSections.map((hero) => (
                    <SwiperSlide key={hero.id}>
                        <div className="relative isolate px-6 lg:px-8 min-h-[85vh] flex items-center">
                            {/* Background tetap statis */}
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={hero.image_path ? `/storage/${hero.image_path}` : '/images/bg.png'}
                                    alt={hero.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gray-900/60" />
                            </div>

                            {/* Content Container dengan Animasi */}
                            <div className="relative z-10 mx-auto max-w-7xl w-full">
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="md:max-w-2xl"
                                >
                                    <motion.h1
                                        variants={itemVariants}
                                        className="text-5xl md:text-8xl font-extrabold tracking-tight text-white mb-4 leading-tight"
                                    >
                                        {hero.title.split(' ').slice(0, -1).join(' ')}{' '}
                                        <span className="text-yellow-400">
                                            {hero.title.split(' ').slice(-1)}
                                        </span>
                                    </motion.h1>

                                    {hero.subtitle && (
                                        <motion.p variants={itemVariants} className="text-gray-200 text-lg mb-8">
                                            {hero.subtitle}
                                        </motion.p>
                                    )}

                                    <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                                        <ScrollLink
                                            to={hero.cta_link || 'about'}
                                            smooth={true}
                                            duration={800}
                                            className="rounded-full px-8 py-3 bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-500 cursor-pointer active:scale-95 transition-all"
                                        >
                                            {hero.cta_text}
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
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default Hero;