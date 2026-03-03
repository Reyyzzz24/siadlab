import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    PlusIcon,
    InformationCircleIcon,
    ClockIcon,
    CalendarIcon,
    CheckCircleIcon,
    CreditCardIcon,
    NoSymbolIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Modal } from "@/components/ui/modal";
import { TransferPaymentContent } from "@/components/ui/Payment/PayNow/TransferPaymentContent";
import { CashConfirmationContent } from "@/components/ui/Payment/PayNow/CashConfirmationContent";
import { AddPaymentForm } from "@/components/ui/Payment/PayNow/AddPaymentForm";
import { ConfirmModal } from '@/components/ui/Payment/PayNow/ConfirmModal';
import { PaymentDetailModal } from '@/components/ui/Payment/PayNow/PaymentDetailModal';

interface Pembayaran {
    id: number;
    id_transaksi?: string;
    jenis_pembayaran: 'cash' | 'transfer';
    kategori: string;
    jenis_tagihan: string[];
    tanggal_tagihan: string;
    tanggal_bayar: string | null;
    nominal: number;
    status: 'belum_bayar' | 'lunas' | 'menunggu_konfirmasi' | 'pending';
    keterangan?: string;
    admin?: { id: number; name: string };
    petugas?: { id: number; name: string };
}

interface Spp {
    id: number;
    kategori_pembayaran: string;
    nominal: number;
    status: string;
}

interface Tagihan {
    id: number;
    jenis_tagihan: string[];
    kategori: string;
    nominal: number;
    tanggal_tagihan: string;
}

interface Props {
    pembayarans: Pembayaran[];
    tagihans: Tagihan[];
    totalPembayaran: string;
    listSpp: Spp[];
}

export default function PayNow({ pembayarans, tagihans, totalPembayaran, listSpp }: Props) {
    useFlashMessages();

    // --- States ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [addPaymentStep, setAddPaymentStep] = useState<'form' | 'transfer'>('form');
    const [selectedPayment, setSelectedPayment] = useState<Pembayaran | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [transferData, setTransferData] = useState<{ id: number; nominal: number; ids?: number[] }>({ id: 0, nominal: 0 });
    const [timeLeft, setTimeLeft] = useState<number>(600);
    const [isProcessing, setIsProcessing] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- Forms ---
    const uploadForm = useForm({
        pembayaran_id: null as number | null,
        selected_ids: [] as number[],
        bukti_bayar: null as File | null,
    });

    const addForm = useForm({
        kategori: 'skripsi',
        jenis_pembayaran: 'transfer',
        nominal: '',
        keterangan: '',
    });

    // --- Timer Logic & LocalStorage ---
    useEffect(() => {
        if (isTransferModalOpen && transferData.id) {
            const storageKey = `payment_expiry_${transferData.id}`;
            const savedExpiry = localStorage.getItem(storageKey);
            const expiryTime = savedExpiry ? parseInt(savedExpiry, 10) : Date.now() + 10 * 60 * 1000;

            if (!savedExpiry) localStorage.setItem(storageKey, expiryTime.toString());

            const updateTimer = () => {
                const now = Date.now();
                const distance = Math.floor((expiryTime - now) / 1000);

                if (distance <= 0) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    localStorage.removeItem(storageKey);
                    setTimeLeft(0);
                    setIsTransferModalOpen(false);
                    alert('Waktu upload bukti bayar habis, silakan ulangi proses.');
                } else {
                    setTimeLeft(distance);
                }
            };

            updateTimer();
            timerRef.current = setInterval(updateTimer, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTransferModalOpen, transferData.id]);

    // --- Helper Functions ---
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0, // <--- Pastikan ini 0
            maximumFractionDigits: 0, // <--- Tambahkan ini juga
        }).format(value);
    };

    const getStatusBadgeClass = (status: string) => {
        const s = status?.toLowerCase();
        const styles: Record<string, string> = {
            lunas: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
            belum_bayar: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
            menunggu_konfirmasi: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400',
            pending: 'bg-blue-100 text-blue-700 border-blue-200',
        };
        return styles[s] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // --- Event Handlers ---
    const toggleSelect = (p: Pembayaran) => {
        if (p.status !== 'belum_bayar') return;

        if (selectedIds.length === 0) {
            setSelectedIds([p.id]);
            return;
        }

        const first = pembayarans.find(x => x.id === selectedIds[0]);
        const firstMethod = first?.jenis_pembayaran;

        if (firstMethod && firstMethod !== p.jenis_pembayaran) {
            alert('Pilih hanya tagihan dengan metode pembayaran yang sama.');
            return;
        }

        setSelectedIds(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const candidates = pembayarans.filter(p => p.status === 'belum_bayar');
            const methods = Array.from(new Set(candidates.map(c => c.jenis_pembayaran)));
            if (methods.length > 1) {
                alert('Tidak dapat memilih semua karena terdapat metode pembayaran yang berbeda. Pilih hanya metode yang sama.');
                return;
            }
            setSelectedIds(candidates.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleBayarClick = () => {
        if (selectedIds.length === 0) return;

        const selectedItems = pembayarans.filter(p => selectedIds.includes(p.id));
        const method = selectedItems[0].jenis_pembayaran;

        // Ensure all selected have same method (defensive)
        const allSame = selectedItems.every(s => s.jenis_pembayaran === method);
        if (!allSame) {
            alert('Pilih hanya tagihan dengan metode pembayaran yang sama.');
            return;
        }

        if (method === 'transfer') {
            const total = selectedItems.reduce((sum, it) => sum + Number(it.nominal), 0);
            setTransferData({ id: selectedItems[0].id, nominal: total, ids: selectedIds });
            // pass selected ids to upload form so backend can handle multiple
            uploadForm.setData('selected_ids', selectedIds);
            uploadForm.setData('pembayaran_id', null);
            setIsTransferModalOpen(true);
        } else {
            // cash
            setIsConfirmModalOpen(true);
        }
    };

    // Pastikan useState sudah di-import dari 'react'
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: 'danger' | 'warning' | 'info';
        action: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        variant: 'info',
        action: () => { },
    });

    const closeConfirm = () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    };

    // Handler untuk membatalkan pembayaran
    const handleCancel = (id: number) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Batalkan Pembayaran',
            message: 'Pembayaran ini akan dibatalkan dan statusnya akan berubah. Apakah Anda yakin?',
            variant: 'danger',
            action: () => {
                router.post(route('payment.cancel', { id: id }), {}, {
                    onStart: () => setIsProcessing(true), // Mulai loading
                    onFinish: () => {
                        setIsProcessing(false); // Selesai loading
                        closeConfirm();
                    },
                    onError: (errors) => {
                        console.error("Gagal membatalkan:", errors);
                    }
                });
            }
        });
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setAddPaymentStep('form');
        addForm.reset();
        uploadForm.reset();
    };

    const handleAddFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isTransfer = addForm.data.jenis_pembayaran === 'transfer';

        addForm.post(route('payment.store'), {
            onSuccess: () => {
                if (isTransfer) {
                    // Beri jeda sedikit agar backend selesai memproses sebelum pencarian,
                    // lalu tutup modal add dan buka modal transfer untuk upload bukti
                    setTimeout(() => {
                        const newPembayaran = pembayarans?.find(p =>
                            p.kategori === addForm.data.kategori &&
                            p.status === 'belum_bayar' &&
                            p.jenis_pembayaran === 'transfer'
                        );

                        if (newPembayaran) {
                            setTransferData({ id: newPembayaran.id, nominal: newPembayaran.nominal });
                            uploadForm.setData('pembayaran_id', newPembayaran.id);
                            // tutup add modal (jangan reset uploadForm karena kita butuh datanya)
                            setIsAddModalOpen(false);
                            setAddPaymentStep('form');
                            addForm.reset();
                            // buka modal transfer
                            setIsTransferModalOpen(true);
                        } else {
                            // fallback: tutup modal jika tidak menemukan
                            handleCloseAddModal();
                        }
                    }, 300);
                } else {
                    handleCloseAddModal();
                }
            },
        });
    };

    // Handler untuk upload bukti transfer
    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post(route('payment.transfer_upload'), {
            onSuccess: handleCloseAddModal
        });
    };

    return (
        <AppLayout>
            <Head title="Bayar Sekarang" />

            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Bayar Sekarang
                </h2>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    Kelola tagihan aktif dan unggah bukti pembayaran Anda.
                </p>

                {/* --- TOTAL CARD --- */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border border-pink-200 dark:border-pink-900/50 rounded-2xl p-6 shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div>
                                <p className="text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Tagihan Anda</p>
                                <h2 className="text-4xl font-black text-pink-700 dark:text-pink-300">{totalPembayaran}</h2>
                            </div>

                            {/* Bagian Jenis Tagihan Aktif */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-pink-600/50 dark:text-pink-400/50 uppercase tracking-wider">Tagihan Aktif saat ini:</p>
                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        // Build map of jenis -> nominal
                                        const jenisNominalMap = new Map<string, number>();

                                        tagihans.forEach(t => {
                                            // Gunakan optional chaining (?.) dan nullish coalescing (??)
                                            const jenisTagihan = t.jenis_tagihan ?? [];

                                            if (jenisTagihan.length > 0) {
                                                jenisTagihan.forEach(jenis => {
                                                    const sppItem = listSpp.find(spp => spp.kategori_pembayaran.toLowerCase() === jenis.toLowerCase());
                                                    // Hindari pembagian dengan nol jika length kosong
                                                    const nominalItem = sppItem ? sppItem.nominal : (t.nominal / (jenisTagihan.length || 1));

                                                    // Add to map (accumulate if already exists)
                                                    const currentNominal = jenisNominalMap.get(jenis.toLowerCase()) || 0;
                                                    jenisNominalMap.set(jenis.toLowerCase(), currentNominal + nominalItem);
                                                });
                                            }
                                        });

                                        // Convert map to sorted array
                                        const jenisArray = Array.from(jenisNominalMap.entries())
                                            .sort((a, b) => a[0].localeCompare(b[0]));

                                        return jenisArray.length > 0 ? (
                                            jenisArray.map(([kat, nominal]) => (
                                                <span key={kat} className="px-3 py-1.5 bg-white/60 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-800 rounded-lg text-[10px] font-bold text-pink-700 dark:text-pink-300 capitalize whitespace-nowrap">
                                                    • {kat.replace(/_/g, ' ')} ({formatRupiah(nominal)})
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-pink-600/60 italic">Tidak ada tagihan aktif</span>
                                        );
                                    })()}
                                </div>
                            </div>

                            <p className="text-sm text-pink-600/70 dark:text-pink-400/60 max-w-md">
                                Segera selesaikan tagihan untuk menghindari penangguhan layanan akademik.
                            </p>
                        </div>

                        <div className="hidden md:flex bg-white/50 dark:bg-pink-900/20 p-4 rounded-2xl border border-pink-100 dark:border-pink-800/40">
                            <ClockIcon className="w-12 h-12 text-pink-500" />
                        </div>
                    </div>
                </div>

                {/* --- ACTIONSBAR --- */}
                <div className="flex flex-col md:flex-row justify-end items-center gap-3 mb-6">
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Tambah Pembayaran
                    </Button>

                    <Button
                        className="w-full md:w-auto bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100 dark:shadow-none animate-in fade-in slide-in-from-right-4"
                        onClick={handleBayarClick}
                    >
                        <CreditCardIcon className="w-4 h-4 mr-2" />
                        Bayar Terpilih ({selectedIds.length})
                    </Button>
                </div>

                {/* --- DESKTOP TABLE VIEW --- */}
                <div className="hidden md:block">
                    <Table>
                        <Thead>
                            <Tr>
                                <Th center className="w-12">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 dark:bg-gray-800"
                                        onChange={handleSelectAll}
                                        checked={selectedIds.length > 0 && selectedIds.length === pembayarans.filter(p => p.status === 'belum_bayar').length}
                                    />
                                </Th>
                                <Th center className="w-16">No</Th>
                                <Th>Kategori & Jenis</Th>
                                <Th>Nominal & Tanggal</Th>
                                <Th>Status</Th>
                                <Th center>Detail</Th>
                                <Th center>Aksi</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {pembayarans.length > 0 ? (
                                pembayarans.map((p, i) => (
                                    <Tr key={p.id} className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                        <Td center>
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 disabled:opacity-30"
                                                disabled={p.status !== 'belum_bayar'}
                                                checked={selectedIds.includes(p.id)}
                                                onChange={() => toggleSelect(p)}
                                            />
                                        </Td>
                                        <Td center className="font-medium">{i + 1}</Td>
                                        <Td>
                                            <div className="font-medium capitalize">{p.kategori.replace('_', ' ')}</div>
                                            <div className="text-[10px] text-gray-400 font-extrabold uppercase">{p.jenis_pembayaran}</div>
                                        </Td>
                                        <Td>
                                            <div className="font-medium text-indigo-600 dark:text-indigo-400">{formatRupiah(p.nominal)}</div>
                                            <div className="flex flex-col gap-1 mt-1 text-[10px] font-bold text-gray-400">
                                                <span className="flex items-center gap-1.5"><CalendarIcon className="w-3 h-3" /> Tagihan: {new Date(p.tanggal_tagihan).toLocaleDateString('id-ID')}</span>
                                                {p.tanggal_bayar && <span className="flex items-center gap-1.5 text-green-600"><CheckCircleIcon className="w-3 h-3" /> Dibayar: {new Date(p.tanggal_bayar).toLocaleDateString('id-ID')}</span>}
                                            </div>
                                        </Td>
                                        <Td>
                                            <span className={`px-2.5 py-1 font-bold rounded-full text-[10px] uppercase tracking-wider border ${getStatusBadgeClass(p.status)}`}>
                                                {p.status.replace('_', ' ')}
                                            </span>
                                        </Td>
                                        <Td center className="relative">
                                            <button
                                                onClick={() => {
                                                    setSelectedPayment(p);
                                                    setIsDetailModalOpen(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                            >
                                                <InformationCircleIcon className="w-5 h-5" />
                                            </button>
                                        </Td>
                                        <Td center>
                                            {p.status === 'belum_bayar' ? (
                                                <Button variant="destructive" size="sm" onClick={() => handleCancel(p.id)}>
                                                    Batalkan
                                                </Button>
                                            ) : (
                                                <span className="text-gray-400 text-xs">No Action</span>
                                            )}
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <Tr>
                                    <Td colSpan={7} className="text-center py-20 text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <NoSymbolIcon className="w-10 h-10 mb-2" />
                                            <p>Tidak ada pembayaran aktif</p>
                                        </div>
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>
                </div>

                {/* --- MOBILE CARD VIEW --- */}
                <div className="md:hidden space-y-4">
                    {pembayarans.length > 0 ? (
                        pembayarans.map((p) => (
                            <div key={p.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3">
                                        <input
                                            type="checkbox"
                                            className="mt-1 rounded border-gray-300"
                                            disabled={p.status !== 'belum_bayar'}
                                            checked={selectedIds.includes(p.id)}
                                            onChange={() => toggleSelect(p)}
                                        />
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-gray-100 capitalize leading-tight">
                                                {p.kategori.replace('_', ' ')}
                                            </h4>
                                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                                                {p.jenis_pembayaran}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusBadgeClass(p.status)}`}>
                                        {p.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 dark:border-slate-800/50 mb-3">
                                    <div>
                                        <p className="text-[9px] text-gray-400 uppercase font-bold mb-0.5">Nominal</p>
                                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatRupiah(p.nominal)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-gray-400 uppercase font-bold mb-0.5">Jatuh Tempo</p>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {new Date(p.tanggal_tagihan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>

                                {p.keterangan && (
                                    <div className="mb-4 p-2 bg-gray-50 dark:bg-slate-800/40 rounded-lg">
                                        <p className="text-[10px] text-gray-400 italic leading-relaxed">
                                            "{p.keterangan}"
                                        </p>
                                    </div>
                                )}

                                {p.tanggal_bayar && (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/10 w-fit px-2 py-1 rounded-md mb-3">
                                        <CheckCircleIcon className="w-3.5 h-3.5" />
                                        Dibayar: {new Date(p.tanggal_bayar).toLocaleDateString('id-ID')}
                                    </div>
                                )}

                                {/* Container Tombol Aksi di Mobile */}
                                <div className="flex justify-between items-center mt-3 pt-3">
                                    {/* Tombol Detail - Dibuat seperti tombol outline agar seimbang */}
                                    <button
                                        onClick={() => {
                                            setSelectedPayment(p);
                                            setIsDetailModalOpen(true);
                                        }}
                                        className="flex items-center justify-center p-2.5 text-gray-500 bg-gray-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
                                        title="Lihat Detail"
                                    >
                                        <InformationCircleIcon className="w-5 h-5" />
                                    </button>

                                    {/* Tombol Batalkan - Menggunakan flex-1 agar memenuhi sisa ruang */}
                                    {p.status === 'belum_bayar' ? (
                                        <button
                                            onClick={() => handleCancel(p.id)}
                                            className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                                        >
                                            Batalkan
                                        </button>
                                    ) : (
                                        // Placeholder agar layout tetap konsisten jika tidak ada tombol batalkan
                                        <div className="flex-1 text-right">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                No Further Action
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-2 border-gray-200 dark:border-slate-800">
                            <NoSymbolIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">Belum ada data tagihan.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALS --- */}
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmConfig.action}
                title={confirmConfig.title}
                message={confirmConfig.message}
                variant={confirmConfig.variant}
                isLoading={isProcessing} // Gunakan state baru di sini
            />

            {/* Modal Transfer */}
            <Modal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                title="Upload Bukti Transfer"
                maxWidth="md"
                // TAMBAHKAN FOOTER DI SINI
                footer={
                    <div className="flex w-full gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsTransferModalOpen(false)}
                        >
                            Tutup
                        </Button>
                        <Button
                            className="flex-1"
                            type="submit"
                            form="transfer-upload-form" // Harus sama dengan ID form di TransferPaymentContent
                            disabled={uploadForm.processing}
                        >
                            {uploadForm.processing ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
                        </Button>
                    </div>
                }
            >
                <TransferPaymentContent
                    nominal={transferData.nominal}
                    timeLeft={timeLeft}
                    processing={uploadForm.processing}
                    // Pastikan di dalam TransferPaymentContent, tag <form> memiliki id="transfer-upload-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        uploadForm.post(route('payment.transfer_upload'), {
                            onSuccess: () => {
                                localStorage.removeItem(`payment_expiry_${transferData.id}`);
                                setIsTransferModalOpen(false);
                            }
                        });
                    }}
                    onFileChange={(file) => uploadForm.setData('bukti_bayar', file)}
                    formatRupiah={formatRupiah}
                    formatTime={formatTime}
                />
            </Modal>

            {/* Modal Konfirmasi Cash */}
            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Konfirmasi Bayar Tunai" maxWidth="md">
                <CashConfirmationContent
                    onConfirm={() => {
                        router.post(route('payment.bayar_selected'), { selected_ids: selectedIds }, {
                            onSuccess: () => {
                                setIsConfirmModalOpen(false);
                                setSelectedIds([]);
                            }
                        });
                    }}
                    onCancel={() => setIsConfirmModalOpen(false)}
                />
            </Modal>

            <PaymentDetailModal
                isOpen={isDetailModalOpen}
                payment={selectedPayment}
                formatRupiah={formatRupiah}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedPayment(null);
                }}
                onPayNowClick={(p) => {
                    // 1. Siapkan data nominal untuk ditampilkan di modal transfer
                    setTransferData({
                        id: p.id,
                        nominal: Number(p.nominal)
                    });

                    // 2. Masukkan ID ke form (sesuai dengan logic uploadForm Anda)
                    uploadForm.setData('pembayaran_id', p.id);

                    // 3. Alihkan modal
                    setIsDetailModalOpen(false);
                    setIsTransferModalOpen(true);
                }}
            />
            {/* Modal Tambah Pembayaran */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                title={addPaymentStep === 'form' ? 'Buat Pembayaran Baru' : 'Upload Bukti Transfer'}
                maxWidth="md"
                footer={
                    <div className="flex w-full gap-2">
                        {addPaymentStep === 'form' ? (
                            <>
                                <Button variant="outline" className="flex-1" onClick={handleCloseAddModal} disabled={addForm.processing}>
                                    Batal
                                </Button>
                                <Button type="submit" form="add-payment-form" className="flex-1" disabled={addForm.processing}>
                                    {addForm.processing ? 'Menyimpan...' : 'Lanjutkan'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" className="flex-1" onClick={handleCloseAddModal}>
                                    Tutup
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    form="transfer-upload-form" // Hubungkan dengan ID form di TransferPaymentContent
                                    disabled={uploadForm.processing}
                                    onClick={handleUploadSubmit} // Trigger handler manual jika form tidak membungkus input
                                >
                                    {uploadForm.processing ? 'Mengirim...' : 'Kirim Bukti'}
                                </Button>
                            </>
                        )}
                    </div>
                }
            >
                {addPaymentStep === 'form' ? (
                    <AddPaymentForm
                        listSpp={listSpp}
                        tagihans={tagihans}
                        data={addForm.data}
                        setData={addForm.setData}
                        errors={addForm.errors}
                        onSubmit={handleAddFormSubmit}
                        onMethodChange={(method) => {
                            if (method === 'transfer') {
                                setTransferData(prev => ({ ...prev, nominal: Number(addForm.data.nominal) }));
                            }
                        }}
                    />
                ) : (
                    <TransferPaymentContent
                        nominal={transferData.nominal}
                        timeLeft={timeLeft}
                        processing={uploadForm.processing}
                        onSubmit={handleUploadSubmit}
                        onFileChange={(file) => uploadForm.setData('bukti_bayar', file)}
                        formatRupiah={formatRupiah}
                        formatTime={formatTime}
                    />
                )}
            </Modal>
        </AppLayout>
    );
}