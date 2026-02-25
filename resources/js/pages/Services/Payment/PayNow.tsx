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

interface Pembayaran {
    id: number;
    jenis_pembayaran: 'cash' | 'transfer';
    kategori: string;
    tanggal_tagihan: string;
    tanggal_bayar: string | null;
    nominal: number;
    status: 'belum_bayar' | 'lunas' | 'menunggu_konfirmasi' | 'pending';
    keterangan?: string;
}

interface Props {
    pembayarans: Pembayaran[];
    totalPembayaran: string;
}

export default function PayNow({ pembayarans, totalPembayaran }: Props) {
    useFlashMessages();

    // --- States ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [transferData, setTransferData] = useState({ id: 0, nominal: 0 });
    const [timeLeft, setTimeLeft] = useState<number>(600);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- Forms ---
    const uploadForm = useForm({
        pembayaran_id: null as number | null,
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
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
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
    const handleBayarClick = () => {
        if (selectedIds.length === 0) return;

        const selectedItems = pembayarans.filter(p => selectedIds.includes(p.id));
        const transferItem = selectedItems.find(p => p.jenis_pembayaran === 'transfer');

        if (transferItem) {
            setTransferData({ id: transferItem.id, nominal: transferItem.nominal });
            uploadForm.setData('pembayaran_id', transferItem.id);
            setIsTransferModalOpen(true);
        } else {
            setIsConfirmModalOpen(true);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(pembayarans.filter(p => p.status === 'belum_bayar').map(p => p.id));
        } else {
            setSelectedIds([]);
        }
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
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Tagihan Anda</p>
                            <h2 className="text-4xl font-black text-pink-700 dark:text-pink-300">{totalPembayaran}</h2>
                            <p className="text-sm text-pink-600/70 dark:text-pink-400/60 max-w-md">Segera selesaikan tagihan untuk menghindari penangguhan layanan akademik.</p>
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
                        Tambah Tagihan
                    </Button>

                    {selectedIds.length > 0 && (
                        <Button
                            className="w-full md:w-auto bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100 dark:shadow-none animate-in fade-in slide-in-from-right-4"
                            onClick={handleBayarClick}
                        >
                            <CreditCardIcon className="w-4 h-4 mr-2" />
                            Bayar Terpilih ({selectedIds.length})
                        </Button>
                    )}
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
                                <Th center>Opsi</Th>
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
                                                onChange={() => setSelectedIds(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                                            />
                                        </Td>
                                        <Td center className="text-gray-400 font-medium">{i + 1}</Td>
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
                                                onClick={() => setSelectedDetail(selectedDetail === p.id ? null : p.id)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                            >
                                                <InformationCircleIcon className="w-5 h-5" />
                                            </button>
                                            {selectedDetail === p.id && (
                                                <div className="absolute right-12 top-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-xl p-4 w-60 text-left animate-in fade-in zoom-in duration-150">
                                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1">Catatan:</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed">{p.keterangan || 'Tidak ada catatan tambahan.'}</p>
                                                </div>
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
                                            onChange={() => setSelectedIds(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
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

            {/* Modal Transfer */}
            <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Upload Bukti Transfer" maxWidth="md">
                <TransferPaymentContent
                    nominal={transferData.nominal}
                    timeLeft={timeLeft}
                    processing={uploadForm.processing}
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

            {/* Modal Tambah Tagihan */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Buat Tagihan Baru"
                maxWidth="md"
                footer={
                    <>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsAddModalOpen(false)} disabled={addForm.processing}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            form="add-payment-form"
                            disabled={addForm.processing}
                        >
                            {addForm.processing ? 'Menyimpan...' : 'Simpan Tagihan'}
                        </Button>
                    </>
                }
            >
                <AddPaymentForm
                    id="add-payment-form" // Beri ID agar tombol di footer bisa melakukan submit
                    data={addForm.data}
                    setData={addForm.setData}
                    errors={addForm.errors}
                    processing={addForm.processing}
                    onCancel={() => setIsAddModalOpen(false)}
                    onSubmit={(e) => {
                        e.preventDefault();
                        addForm.post(route('payment.store'), {
                            onSuccess: () => {
                                setIsAddModalOpen(false);
                                addForm.reset();
                            }
                        });
                    }}
                />
            </Modal>
        </AppLayout>
    );
}