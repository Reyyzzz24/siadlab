import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { usePage, useForm, router } from '@inertiajs/react';
import { SharedData, EventItem } from '@/types';
import { Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Modal } from "@/components/ui/modal";
import { EventDetailContent } from "@/components/ui/UpcomingEvent/EventDetailContent";
import { EventForm } from "@/components/ui/UpcomingEvent/EventForm";
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface Props {
    events: EventItem[];
}

// --- Animasi Variants (Optimasi Smoothness) ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12, // Jeda antar kartu sedikit lebih tenang
            delayChildren: 0.1
        }
    }
};

const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.96, // Scale diperhalus agar tidak terlalu jauh jalannya
        y: 15,
        filter: "blur(4px)" // Menambah kesan pop-up halus
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            type: "spring",
            stiffness: 80, // Lebih rendah agar gerakan lebih "floaty" (melayang)
            damping: 15,   // Mengurangi efek membal yang kaku
            mass: 0.8,
            duration: 0.6
        }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        filter: "blur(8px)",
        transition: { duration: 0.3, ease: "easeInOut" }
    }
};

// --- Komponen EventCard ---
const EventCard = React.memo(({ event, isAdmin, onDetail, onDelete, onEdit }: {
    event: EventItem,
    isAdmin: boolean,
    onDetail: (e: EventItem) => void,
    onDelete: (id: number) => void,
    onEdit: (e: EventItem) => void
}) => (
    <motion.div
        layout
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        exit="exit"
        viewport={{ once: true, margin: "-20px" }}
        whileHover={{ y: -8, transition: { duration: 0.4, ease: "circOut" } }}
        className="h-full"
    >
        <Card className="h-full overflow-hidden border-gray-100 dark:border-zinc-800 bg-white dark:bg-background hover:shadow-md transition-shadow duration-500 group p-0 gap-0 flex flex-col transform-gpu">
            {/* Bagian Atas: Gambar & Badge */}
            <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-zinc-800">
                <img
                    src={event.poster ? `/storage/${event.poster}` : '/images/Placeholder_Image.webp'}
                    alt={event.judul}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out will-change-transform"
                    loading="lazy"
                />

                <div className="absolute top-4 left-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 shadow-sm">
                    <Calendar size={14} />
                    {new Date(event.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>

                {event.status === 'draft' && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm">
                        Draft
                    </div>
                )}
            </div>

            <CardHeader className="px-6 pt-6 pb-2 space-y-1">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100 line-clamp-1">
                    {event.judul}
                </CardTitle>

                <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400">
                    <MapPin size={14} className="text-blue-500" />
                    <span className="text-xs font-medium truncate">
                        {event.lokasi || 'Lokasi belum ditentukan'}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-4">
                <p className="text-gray-600 dark:text-zinc-400 text-sm line-clamp-2">
                    {event.deskripsi}
                </p>
            </CardContent>

            <CardFooter className="px-6 py-6 mt-auto flex items-center justify-between dark:border-zinc-800 bg-white dark:bg-background">
                <button
                    onClick={() => onDetail(event)}
                    className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                    Lihat Detail →
                </button>

                {isAdmin && (
                    <div className="flex gap-4">
                        <button
                            onClick={() => onEdit(event)}
                            className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-500 transition-transform active:scale-90"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button
                            onClick={() => onDelete(event.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 transition-transform active:scale-90"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}
            </CardFooter>
        </Card>
    </motion.div>
));

const UpcomingEvent: React.FC<Props> = ({ events = [] }) => {
    useFlashMessages();
    const { auth } = usePage<SharedData>().props;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

    const publishedEvents = useMemo(() => events.filter(e => e.status === 'published'), [events]);
    const draftEvents = useMemo(() => events.filter(e => e.status === 'draft'), [events]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'petugas';

    // Update currentIndex saat scroll
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft;
            const cardWidth = container.firstElementChild?.clientWidth || 1;
            const gap = 32; // Tailwind gap-8
            const totalWidth = cardWidth + gap;
            const index = Math.round(scrollLeft / totalWidth);
            setCurrentIndex(index);
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [publishedEvents]);

    const { data, setData, post, reset, processing, errors } = useForm({
        judul: '',
        deskripsi: '',
        tanggal: '',
        lokasi: '',
        poster: null as File | null,
        status: 'draft' as 'draft' | 'published',
    });

    const handleDelete = useCallback((id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus event ini?')) {
            router.delete(route('events.destroy', id));
        }
    }, []);

    const handleEdit = useCallback((event: EventItem) => {
        setEditingEvent(event);
        const formattedDate = event.tanggal.split('T')[0];
        setData({
            judul: event.judul,
            deskripsi: event.deskripsi,
            tanggal: formattedDate,
            lokasi: event.lokasi || '',
            poster: null,
            status: event.status as 'draft' | 'published',
        });
        setIsEditModalOpen(true);
    }, [setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('events.store'), {
            onSuccess: () => { setIsCreateModalOpen(false); reset(); },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('events.update', editingEvent?.id), {
            forceFormData: true,
            onSuccess: () => { setIsEditModalOpen(false); reset(); },
        });
    };

    return (
        <section className="w-full bg-gray-50 dark:bg-gray-900/50 py-16 transition-colors duration-300" id="event">
            <div className="container mx-auto px-6 max-w-6xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between mb-10"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-zinc-100">Upcoming Event</h2>
                    {isAdmin && (
                        <Button onClick={() => { reset(); setIsCreateModalOpen(true); }} className="gap-2 shadow-lg hover:scale-105 transition-transform duration-300">
                            <Plus size={18} /> Tambah Event
                        </Button>
                    )}
                </motion.div>

                {/* Published Events */}
                <motion.div
                    ref={scrollRef}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex gap-8 overflow-x-auto scrollbar-hide mb-2 py-2"
                >
                    <AnimatePresence mode="popLayout">
                        {publishedEvents.length > 0 ? (
                            publishedEvents.map((event) => (
                                <div className="w-[320px] flex-shrink-0" key={event.id}>
                                    <EventCard
                                        event={event}
                                        isAdmin={isAdmin}
                                        onDetail={setSelectedEvent}
                                        onDelete={handleDelete}
                                        onEdit={handleEdit}
                                    />
                                </div>
                            ))
                        ) : (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-gray-500 dark:text-zinc-500 text-center py-10"
                            >
                                Belum ada event publik.
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>

                <div className="flex justify-center gap-2 mt-2 md:hidden">
                    {publishedEvents.map((_, i) => (
                        <span
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === currentIndex
                                ? "bg-blue-600 dark:bg-blue-400"
                                : "bg-gray-300 dark:bg-zinc-500"
                                }`}
                        ></span>
                    ))}
                </div>

                {/* Draft Events (Admin Only) */}
                {isAdmin && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="mt-16"
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-zinc-100">Draft Event</h2>
                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase">
                                Internal Only
                            </span>
                        </div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="flex gap-8 overflow-x-auto scrollbar-hide py-2"
                        >
                            <AnimatePresence mode="popLayout">
                                {draftEvents.length > 0 ? (
                                    draftEvents.map((event) => (
                                        <div className="w-[320px] flex-shrink-0" key={event.id}>
                                            <EventCard
                                                event={event}
                                                isAdmin={isAdmin}
                                                onDetail={setSelectedEvent}
                                                onDelete={handleDelete}
                                                onEdit={handleEdit}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-gray-400 dark:text-zinc-600 text-center py-10"
                                    >
                                        Tidak ada draft.
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                        <div className="flex justify-center gap-2 mt-2 md:hidden">
                            {publishedEvents.map((_, i) => (
                                <span
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === currentIndex
                                        ? "bg-blue-600 dark:bg-blue-400"
                                        : "bg-gray-300 dark:bg-zinc-500"
                                        }`}
                                ></span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Modals */}
            <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} maxWidth="3xl" noPadding>
                {selectedEvent && <EventDetailContent event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
            </Modal>

            {/* --- MODAL CREATE --- */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => { setIsCreateModalOpen(false); reset(); }}
                title="Tambah Event Baru"
                maxWidth="lg"
                footer={
                    <>
                        <Button
                            variant="outline" // Tambah variant outline di sini
                            className="flex-1"
                            onClick={() => { setIsCreateModalOpen(false); reset(); }}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex-1"
                            disabled={processing}
                        >
                            {processing ? 'Menyimpan...' : 'Tambah Event'}
                        </Button>
                    </>
                }
            >
                <EventForm data={data} setData={setData} errors={errors} processing={processing} />
            </Modal>

            {/* --- MODAL EDIT --- */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); reset(); }}
                title="Edit Event"
                maxWidth="lg"
                footer={
                    <>
                        <Button
                            variant="outline" // Tambah variant outline di sini
                            className="flex-1"
                            onClick={() => { setIsEditModalOpen(false); reset(); }}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleUpdate}
                            disabled={processing}
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </>
                }
            >
                <EventForm
                    isEdit
                    currentPoster={editingEvent?.poster}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                />
            </Modal>
        </section>
    );
};

export default UpcomingEvent;