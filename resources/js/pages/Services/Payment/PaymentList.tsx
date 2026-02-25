import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    XMarkIcon,
    FunnelIcon,
    CheckIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    NoSymbolIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { FilterDropdown, FilterItem } from '@/components/FilterDropdown';
import { SearchInput } from '@/components/SearchInput'; // Pastikan path ini benar
import { ArrowPathIcon } from '@heroicons/react/24/outline'; // Untuk tombol reset cepat
import { BuktiTransferModal } from '@/components/ui/Payment/PaymentList/ProofTransferModal';
import { NoteDetailModal } from '@/components/ui/Payment/PaymentList/Note';
import { ConfirmActionModal } from '@/components/ui/Payment/PaymentList/ConfirmModal';
import { Pagination } from '@/components/Pagination';

interface Pembayaran {
    id: number;
    id_transaksi?: string; // <- tambahkan ini
    user?: {
        name: string;
    };
    nama_pembayar?: string;
    jenis_pembayaran: string;
    kategori: string;
    tanggal_tagihan: string;
    tanggal_bayar: string | null;
    nominal: number;
    status: 'belum_bayar' | 'menunggu_konfirmasi' | 'lunas' | 'ditolak';
    bukti_bayar?: string;
    keterangan?: string;
    created_at: string;
}

interface Props {
    payments: {
        data: Pembayaran[];
        links: any[];
        current_page: number;
    };
    filters: {
        status?: string;
        kategori?: string;
        jenis_pembayaran?: string;
        search?: string;
    };
}

export default function PaymentList({ payments, filters }: Props) {
    useFlashMessages();
    const [search, setSearch] = useState(filters.search || '');
    // State untuk Modal Bukti
    const [isBuktiModalOpen, setIsBuktiModalOpen] = useState(false);
    const [selectedBukti, setSelectedBukti] = useState<string | null>(null);

    // State untuk Modal Detail/Note
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState<string>("");

    // State untuk Modal Konfirmasi Approve/Reject
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmData, setConfirmData] = useState<{ id: number, status: 'lunas' | 'ditolak' } | null>(null);

    // State untuk Popover (Opsional jika Anda masih ingin menggunakannya)
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [params, setParams] = useState({
        status: filters.status || '',
        kategori: filters.kategori || '',
        jenis_pembayaran: filters.jenis_pembayaran || '',
        search: filters.search || '', // Tambahkan search ke params
    });
    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(number);
    };

    // Fungsi Trigger Modal Konfirmasi
    const triggerConfirm = (id: number, status: 'lunas' | 'ditolak') => {
        setConfirmData({ id, status });
        setIsConfirmModalOpen(true);
    };

    // Fungsi Eksekusi Status Update
    const executeUpdateStatus = () => {
        if (!confirmData) return;
        const url = confirmData.status === 'lunas'
            ? route('payment.approve', confirmData.id)
            : route('payment.reject', confirmData.id);

        router.post(url, {}, {
            preserveScroll: true,
            onSuccess: () => setIsConfirmModalOpen(false)
        });
    };

    // Fungsi Trigger Modal Note
    const showNote = (note: string) => {
        setCurrentNote(note);
        setIsNoteModalOpen(true);
    };

    // Fungsi Trigger Modal Bukti
    const openBukti = (path: string) => {
        setSelectedBukti(path);
        setIsBuktiModalOpen(true);
    };

    const updateData = (newParams: any) => {
        router.get(route('payment.list'), newParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        const newParams = {
            ...params,
            search: value
        };
        setParams(newParams);
        updateData(newParams);
    };

    const getPaymentStatusBadge = (status: string) => {
        const s = status?.toLowerCase();

        const styles = {
            lunas: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
            belum_bayar: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
            pending: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
            menunggu_konfirmasi: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800/50',
            ditolak: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
        };

        // Default ke warna abu-abu jika status tidak dikenal
        return styles[s as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700';
    };

    return (
        <AppLayout>
            <Head title="Daftar Pembayaran" />

            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Daftar Pembayaran
                </h2>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    Daftar seluruh Pembayaran mahasiswa.
                </p>

                {/* --- HEADER SECTION: Search & Filter --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">

                        {/* 2. Tombol/Input Search */}
                        <div className="w-full sm:w-64">
                            <SearchInput
                                placeholder="Cari nama atau ID TRX..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                onSubmit={() => { }}
                                className="w-full"
                            />
                        </div>

                        {/* Group Filter & Reset */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="flex-1 sm:flex-none">
                                <FilterDropdown
                                    isOpen={isFilterOpen}
                                    onOpenChange={setIsFilterOpen}
                                    onReset={() => {
                                        setSearch('');
                                        const resetParams = { status: '', kategori: '', jenis_pembayaran: '', search: '' };
                                        setParams(resetParams);
                                        updateData(resetParams);
                                    }}
                                >
                                    <FilterItem
                                        label="Status"
                                        value={params.status}
                                        onValueChange={(val) => {
                                            const newParams = { ...params, status: val };
                                            setParams(newParams);
                                            updateData(newParams);
                                        }}
                                        options={[
                                            { label: 'Lunas', value: 'lunas' },
                                            { label: 'Menunggu Konfirmasi', value: 'menunggu_konfirmasi' },
                                            { label: 'Ditolak', value: 'ditolak' },
                                        ]}
                                    />

                                    {/* Filter Kategori */}
                                    <FilterItem
                                        label="Kategori"
                                        value={params.kategori}
                                        onValueChange={(val) => {
                                            setParams(prev => {
                                                const newParams = { ...prev, kategori: val };
                                                updateData(newParams);
                                                return newParams;
                                            });
                                        }}
                                        options={[
                                            { label: 'Skripsi', value: 'skripsi' },
                                            { label: 'Praktikum', value: 'praktikum' },
                                            { label: 'Semhas', value: 'semhas' },
                                            { label: 'Sempro', value: 'sempro' },
                                            { label: 'Lainnya', value: 'other' },
                                        ]}
                                    />

                                    {/* Filter Jenis Pembayaran */}
                                    <FilterItem
                                        label="Jenis Pembayaran"
                                        value={params.jenis_pembayaran}
                                        onValueChange={(val) => {
                                            setParams(prev => {
                                                const newParams = { ...prev, jenis_pembayaran: val };
                                                updateData(newParams);
                                                return newParams;
                                            });
                                        }}
                                        options={[
                                            { label: 'Transfer', value: 'transfer' },
                                            { label: 'Tunai', value: 'cash' },
                                        ]}
                                    />
                                </FilterDropdown>
                            </div>

                            {/* Tombol Reset Cepat */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 text-gray-500 shrink-0"
                                onClick={() => {
                                    setSearch('');
                                    const resetParams = { status: '', kategori: '', jenis_pembayaran: '', search: '' };
                                    setParams(resetParams);
                                    updateData(resetParams);
                                }}
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <Table>
                    <Thead>
                        <Tr>
                            <Th center className="w-12">No</Th>
                            <Th>Nama Pembayar</Th>
                            <Th>Jenis & Kategori</Th>
                            <Th>Nominal</Th>
                            <Th>Status</Th>
                            <Th center>Aksi</Th>
                            <Th center>Detail</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {payments.data.length > 0 ? (
                            payments.data.map((p, i) => (
                                <Tr key={p.id}>
                                    <Td center>{i + 1 + (payments.current_page - 1) * payments.data.length}</Td>
                                    <Td>
                                        <div className="font-medium capitalize">{p.nama_pembayar}</div>
                                        <div className="text-xs text-gray-400">TRX: #{p.id_transaksi || p.id}</div>
                                    </Td>
                                    <Td>
                                        <div className="capitalize">{p.kategori.replace('_', ' ')}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{p.jenis_pembayaran}</div>
                                    </Td>
                                    <Td>
                                        <div>{formatRupiah(p.nominal)}</div>
                                        <div className="text-xs font-bold text-green-500">
                                            Bayar: {p.tanggal_bayar ? new Date(p.tanggal_bayar).toLocaleDateString('id-ID') : 'Belum'}
                                        </div>
                                    </Td>
                                    <Td>
                                        <span className={`px-2.5 py-1 font-bold rounded-full text-[10px] uppercase tracking-widest border ${getPaymentStatusBadge(p.status)}`}>
                                            {p.status.replace('_', ' ')}
                                        </span>
                                    </Td>
                                    <Td center>
                                        <div className="flex justify-center gap-2">
                                            {p.status === 'menunggu_konfirmasi' ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => triggerConfirm(p.id, 'lunas')}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckIcon className="w-5 h-5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => triggerConfirm(p.id, 'ditolak')}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XMarkIcon className="w-5 h-5" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 italic">Selesai</span>
                                            )}
                                        </div>
                                    </Td>
                                    <Td center>
                                        <div className="flex flex-col items-center gap-1">
                                            <button
                                                onClick={() => showNote(p.keterangan || 'Tidak ada catatan.')}
                                                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"
                                            >
                                                <InformationCircleIcon className="w-5 h-5" />
                                            </button>
                                            {p.bukti_bayar && (
                                                <button
                                                    onClick={() => openBukti(p.bukti_bayar!)}
                                                    className="text-[9px] text-blue-600 font-bold underline uppercase"
                                                >
                                                    Bukti
                                                </button>
                                            )}
                                        </div>
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={7} className="text-center py-20 text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <NoSymbolIcon className="w-10 h-10 mb-2" />
                                        <p>Tidak ada data peminjaman ditemukan</p>
                                    </div>
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
                <div className="mt-6">
                    <Pagination links={payments.links} />
                </div>
            </div>

            {/* --- MODALS SECTION --- */}
            <ConfirmActionModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={executeUpdateStatus}
                data={confirmData}
            />

            <NoteDetailModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                note={currentNote}
            />

            <BuktiTransferModal
                isOpen={isBuktiModalOpen}
                onClose={() => setIsBuktiModalOpen(false)}
                imageSrc={selectedBukti}
            />
        </AppLayout >
    );
}