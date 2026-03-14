// resources/js/Components/LoadingScreen.tsx
import { motion, Variants, Easing } from 'framer-motion';
import AppLogoIcon from "./app-logo-icon";

export const LoadingScreen = () => {
    const text = "SIADLAB";
    const letters = Array.from(text);

    // Casting ease: "easeInOut" as Easing akan menyelesaikan error Anda
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const letterVariants: Variants = {
        hidden: { y: 0 },
        visible: {
            y: [0, -15, 0],
            transition: {
                duration: 0.8,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut" as Easing // <--- PENTING: Casting ini menghilangkan error
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-[#0b171a] transition-colors duration-500"
        >
            <div className="relative flex flex-col items-center">
                {/* Logo */}
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as Easing }}
                    className="w-24 h-24 mb-6"
                >
                    <AppLogoIcon className="w-full h-full text-cyan-600 dark:text-cyan-400" />
                </motion.div>

                {/* Teks Branding (Huruf Per Huruf) */}
                <motion.h1
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex text-2xl font-bold text-gray-800 dark:text-white tracking-widest uppercase mb-4"
                >
                    {letters.map((char, index) => (
                        <motion.span key={index} variants={letterVariants}>
                            {char}
                        </motion.span>
                    ))}
                </motion.h1>

                {/* Text "Loading" */}
                <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-xs font-medium text-gray-400 tracking-[0.2em]"
                >
                    INITIALIZING...
                </motion.p>
            </div>
        </motion.div>
    );
};