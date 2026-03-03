import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    NoSymbolIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    XMarkIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { FilterDropdown, FilterItem } from '@/components/FilterDropdown';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/Pagination';
import RejectReasonModal from '@/components/ui/RejectReasonModal';

interface Peminjaman {
    id: number;
    barang?: {
        namabarang: string;
        idbarang: string;
    };
    user?: {
        name: string;
    };
    nama_peminjam: string;
    tanggal_pinjam: string;
    tanggal_kembali: string | null;
    jumlah: number;
    status: 'booked' | 'dipinjam' | 'kembali' | 'terlambat' | 'ditolak' | 'proses_kembali';
    id_transaksi: any;
}

interface Props {
    peminjamans: {
        data: Peminjaman[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        status?: string;
        search?: string;
    };
}

export default function LendingList({ peminjamans, filters }: Props) {
    useFlashMessages();

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectPayload, setRejectPayload] = useState<{ id: number; action: 'cancel' | 'rejectBack' } | null>(null);

    const openRejectModal = (id: number, action: 'cancel' | 'rejectBack') => {
        setRejectPayload({ id, action });
        setIsRejectModalOpen(true);
    };

    const submitRejectWithReason = (reason: string) => {
        if (!rejectPayload) return;
        const routeName = rejectPayload.action === 'cancel' ? route('item-lending.cancel', rejectPayload.id) : route('item-lending.rejectBack', rejectPayload.id);
        router.post(routeName, { alasan: reason }, { onSuccess: () => { setIsRejectModalOpen(false); setRejectPayload(null); router.reload(); } });
    };

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');
    const [params, setParams] = useState({
        status: filters?.status || '',
        search: filters?.search || '',
    });

    const updateData = (newParams: any) => {
        router.get(route('item-lending.list'), newParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleFilter = (key: string, value: any) => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);
        updateData(newParams);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const handleReset = () => {
        setSearch('');
        const resetParams = { status: '', search: '' };
        setParams(resetParams);
        updateData(resetParams);
    };

    const getStatusBadge = (status: string) => {
        const currentStatus = status?.toLowerCase();
        const styles = {
            booked: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
            dipinjam: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
            kembali: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
            terlambat: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
            ditolak: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
            proses_kembali: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50',
        };
        return styles[currentStatus as keyof typeof styles] || 'bg-gray-100 text-gray-700';
    };

    return (
        <AppLayout>
            <Head title="Daftar Peminjaman Barang" />

            <div className="p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        Daftar Peminjaman Barang
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Kelola permintaan dan status peminjaman barang inventaris.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                className="pl-9 w-full h-10"
                                placeholder="Cari peminjam/barang..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="flex-1 sm:flex-none">
                                <FilterDropdown
                                    isOpen={isFilterOpen}
                                    onOpenChange={setIsFilterOpen}
                                    onReset={handleReset}
                                >
                                    <FilterItem
                                        label="Status"
                                        value={params.status || 'all'}
                                        onValueChange={(val) => handleFilter('status', val === 'all' ? '' : val)}
                                        options={[
                                            { label: 'Semua Status', value: 'all' },
                                            { label: 'Booked', value: 'booked' },
                                            { label: 'Dipinjam', value: 'dipinjam' },
                                            { label: 'Kembali', value: 'kembali' },
                                            { label: 'Proses Kembali', value: 'proses_kembali' },
                                            { label: 'Terlambat', value: 'terlambat' },
                                            { label: 'Ditolak', value: 'ditolak' },
                                        ]}
                                    />
                                </FilterDropdown>
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 text-gray-500 hover:text-cyan-600 shrink-0"
                                onClick={handleReset}
                                title="Reset Filter"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                    <Table>
                        <Thead>
                            <Tr>
                                <Th center className="w-16">No</Th>
                                <Th>Peminjam</Th>
                                <Th>Barang</Th>
                                <Th center>Jumlah</Th>
                                <Th>Tgl Pinjam</Th>
                                <Th>Tgl Kembali</Th>
                                <Th>Status</Th>
                                <Th center className="w-28">Aksi</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {peminjamans.data.length > 0 ? (
                                peminjamans.data.map((p, i) => (
                                    <Tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <Td center>{peminjamans.from + i}</Td>
                                        <Td>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{p.nama_peminjam}</span>
                                                <span className="text-xs text-gray-400">{p.id_transaksi}</span>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div className="flex flex-col">
                                                <span className="font-medium capitalize">{p.barang?.namabarang}</span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{p.barang?.idbarang}</span>
                                            </div>
                                        </Td>
                                        <Td center className="font-medium">{p.jumlah} Unit</Td>
                                        <Td>{new Date(p.tanggal_pinjam).toLocaleDateString('id-ID')}</Td>
                                        <Td>
                                            {p.tanggal_kembali
                                                ? new Date(p.tanggal_kembali).toLocaleDateString('id-ID')
                                                : <span className="text-gray-400 italic">Belum kembali</span>
                                            }
                                        </Td>
                                        <Td>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(p.status)}`}>
                                                {p.status.replace('_', ' ')}
                                            </span>
                                        </Td>
                                        <Td center>
                                            <div className="flex items-center justify-center gap-1">
                                                {p.status === 'booked' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => router.post(route('item-lending.approve', p.id))}
                                                            className="h-8 w-8 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                            title="Setujui"
                                                        >
                                                            <CheckIcon className="w-5 h-5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openRejectModal(p.id, 'cancel')}
                                                            className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            title="Tolak"
                                                        >
                                                            <XMarkIcon className="w-5 h-5" />
                                                        </Button>
                                                    </>
                                                )}
                                                {p.status === 'proses_kembali' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => router.post(route('item-lending.approveBack', p.id))}
                                                            className="h-8 w-8 text-green-600 hover:bg-green-50"
                                                            title="Terima Pengembalian"
                                                        >
                                                            <CheckIcon className="w-5 h-5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openRejectModal(p.id, 'rejectBack')}
                                                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                                                            title="Tolak Pengembalian"
                                                        >
                                                            <XMarkIcon className="w-5 h-5" />
                                                        </Button>
                                                    </>
                                                )}
                                                {!['booked', 'proses_kembali'].includes(p.status) && (
                                                    <span className="text-gray-400 text-[10px] italic">Selesai</span>
                                                )}
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <Tr>
                                    <Td colSpan={8} className="text-center py-20 text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <NoSymbolIcon className="w-10 h-10 mb-2" />
                                            <p>Tidak ada data peminjaman ditemukan</p>
                                        </div>
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>
                </div>

                <div className="mt-6">
                    <Pagination links={peminjamans.links} />
                </div>
            </div>
            <RejectReasonModal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} onSubmit={submitRejectWithReason} />
        </AppLayout>
    );
}