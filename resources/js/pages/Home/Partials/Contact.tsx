import React from 'react';
import { useForm } from '@inertiajs/react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact: React.FC = () => {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        email: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Menggunakan fetch untuk Formspree
        fetch("https://formspree.io/f/xrbgknkv", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { 'Accept': 'application/json' }
        }).then(response => {
            if (response.ok) {
                alert("Pesan berhasil dikirim!");
                reset();
            }
        });
    };

    // Variabel animasi untuk daftar kontak (stagger)
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
    };

    return (
        <section id="contact" className="py-24 bg-gray-50 dark:bg-gray-900/50 transition-colors duration-500 overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* KIRI: Form Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="bg-white dark:bg-background p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-zinc-800"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Name</label>
                                <input 
                                    type="text" 
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Your Name"
                                    required
                                    className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-background text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Email</label>
                                <input 
                                    type="email" 
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="example@mail.com"
                                    required
                                    className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-background text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Message</label>
                                <textarea 
                                    rows={4} 
                                    value={data.message}
                                    onChange={e => setData('message', e.target.value)}
                                    placeholder="Write your message here..."
                                    required
                                    className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-background text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                                />
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <button 
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50"
                                >
                                    {processing ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            <span>Send Message</span>
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        </form>
                    </motion.div>

                    {/* KANAN: Contact Info */}
                    <div className="lg:pl-8">
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="mb-12"
                        >
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                Hubungi <span className="text-cyan-600 dark:text-cyan-400">Kami</span>
                            </h2>
                            <p className="mt-6 text-gray-500 dark:text-zinc-400 leading-relaxed text-lg">
                                Silakan hubungi kami melalui formulir atau kontak di bawah ini untuk pertanyaan lebih lanjut mengenai layanan kami.
                            </p>
                        </motion.div>

                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            {/* Address */}
                            <motion.div variants={itemVariants} className="flex items-start gap-6 group">
                                <div className="flex-shrink-0 w-14 h-14 bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center group-hover:bg-cyan-600 dark:group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 transform group-hover:-rotate-6">
                                    <MapPin size={26} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1">Address</h4>
                                    <p className="text-gray-800 dark:text-zinc-200 font-medium leading-snug">
                                        Jl. Tol Ciawi No.1 Bogor 16720<br />
                                        Jawa Barat, Indonesia
                                    </p>
                                </div>
                            </motion.div>

                            {/* Phone */}
                            <motion.div variants={itemVariants} className="flex items-start gap-6 group">
                                <div className="flex-shrink-0 w-14 h-14 bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center group-hover:bg-cyan-600 dark:group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 transform group-hover:-rotate-6">
                                    <Phone size={26} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1">Phone</h4>
                                    <p className="text-gray-800 dark:text-zinc-200 font-medium">0251-8240-773</p>
                                </div>
                            </motion.div>

                            {/* Email */}
                            <motion.div variants={itemVariants} className="flex items-start gap-6 group">
                                <div className="flex-shrink-0 w-14 h-14 bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center group-hover:bg-cyan-600 dark:group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 transform group-hover:-rotate-6">
                                    <Mail size={26} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1">Email</h4>
                                    <p className="text-gray-800 dark:text-zinc-200 font-medium">filkom@unida.ac.id</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Contact;