import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    InformationCircleIcon,
    MagnifyingGlassIcon,
    CalendarIcon,
    ArrowPathIcon,
    NoSymbolIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { FilterDropdown, FilterItem } from '@/components/FilterDropdown';
import { Input } from '@/components/ui/input';
import DetailModal from '@/components/ui/ItemLending/History/DetailModal';
import { Pagination } from '@/components/Pagination';

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
    petugas?: {
        name: string;
    };
    keterangan?: string;
    id_transaksi: any;
}

interface Props {
    peminjamans: {
        data: Peminjaman[];
        links: any[];
        current_page: number;
        from: number;
    };
    filters: {
        status?: string;
        search?: string;
    };
}

export default function LendingHistory({ peminjamans, filters }: Props) {
    useFlashMessages();

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<Peminjaman | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');
    const [params, setParams] = useState({
        status: filters?.status || '',
        search: filters?.search || '',
    });

    const handleFilter = (key: string, value: any) => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);
        updateData(newParams);
    };

    const openDetail = (data: Peminjaman) => {
        setSelectedData(data);
        setIsDetailModalOpen(true);
    };

    const updateData = (newParams: any) => {
        router.get(route('item-lending.history'), newParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const newParams = { ...params, search: search };
        setParams(newParams);
        updateData(newParams);
    };

    const getStatusBadge = (status: string) => {
        const currentStatus = status?.toLowerCase();
        const styles = {
            booked: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
            dipinjam: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
            dikembalikan: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
            terlambat: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
            ditolak: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
        };
        return styles[currentStatus as keyof typeof styles] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    return (
        <AppLayout>
            <Head title="Riwayat Peminjaman Barang" />

            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Riwayat Peminjaman
                </h2>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    Daftar histori peminjaman sarana dan prasarana.
                </p>

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
                                    onReset={() => {
                                        setSearch('');
                                        const resetParams = { status: '', search: '' };
                                        setParams(resetParams);
                                        updateData(resetParams);
                                    }}
                                >
                                    <FilterItem
                                        label="Status Peminjaman"
                                        value={params.status || 'all'}
                                        onValueChange={(val) => handleFilter('status', val === 'all' ? '' : val)}
                                        options={[
                                            { label: 'Booked', value: 'booked' },
                                            { label: 'Dipinjam', value: 'dipinjam' },
                                            { label: 'Dikembalikan', value: 'dikembalikan' },
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
                                onClick={() => {
                                    setSearch('');
                                    const resetParams = { status: '', search: '' };
                                    setParams(resetParams);
                                    updateData(resetParams);
                                }}
                                title="Reset All"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {peminjamans.data.length > 0 ? (
                            peminjamans.data.map((p) => (
                                <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all active:scale-[0.98]">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-800 dark:text-gray-100 leading-tight">
                                                {p.nama_peminjam}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">
                                                User: {p.user?.name || '-'}
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-widest ${getStatusBadge(p.status)}`}>
                                            {p.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="py-3 border-y border-gray-50 dark:border-gray-700/50 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <span className="text-xs font-bold">{p.jumlah}x</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold capitalize">{p.barang?.namabarang || 'Barang Dihapus'}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">ID: {p.barang?.idbarang || '-'}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <CalendarIcon className="w-3.5 h-3.5" />
                                                <span>Pinjam: {new Date(p.tanggal_pinjam).toLocaleDateString('id-ID')}</span>
                                            </div>
                                            {p.tanggal_kembali && (
                                                <div className="flex items-center gap-1.5 text-green-600">
                                                    <ArrowPathIcon className="w-3.5 h-3.5" />
                                                    <span>Kembali: {new Date(p.tanggal_kembali).toLocaleDateString('id-ID')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <button
                                            onClick={() => openDetail(p)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors border border-gray-100 dark:border-gray-600"
                                        >
                                            <InformationCircleIcon className="w-4 h-4" />
                                            Detail Peminjaman
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-10 text-center border border-dashed border-gray-200 dark:border-gray-700 text-gray-400">
                                <NoSymbolIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm italic">Tidak ada data peminjaman</p>
                            </div>
                        )}
                    </div>

                    <div className="hidden md:block">
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th center>No</Th>
                                    <Th>Informasi Peminjam</Th>
                                    <Th>Barang & Jumlah</Th>
                                    <Th>Waktu Pinjam</Th>
                                    <Th>Status</Th>
                                    <Th center>Detail</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {peminjamans.data.length > 0 ? (
                                    peminjamans.data.map((p, i) => (
                                        <Tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                            <Td center>{peminjamans.from + i}</Td>
                                            <Td>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{p.nama_peminjam}</span>
                                                    <span className="text-xs text-gray-400">{p.id_transaksi}</span>
                                                </div>
                                            </Td>
                                            <Td>
                                                <div className="font-medium capitalize">{p.barang?.namabarang || 'Barang Dihapus'}</div>
                                                <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded text-[9px]">{p.jumlah} Unit</span>
                                                    <span>•</span>
                                                    <span className="font-mono tracking-tighter">{p.barang?.idbarang || '-'}</span>
                                                </div>
                                            </Td>
                                            <Td>
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[11px] font-bold flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                        <CalendarIcon className="w-3 h-3" /> Pinjam: {new Date(p.tanggal_pinjam).toLocaleDateString('id-ID')}
                                                    </div>
                                                    {p.tanggal_kembali && (
                                                        <div className="text-[11px] font-bold flex items-center gap-1.5 text-green-500">
                                                            <ArrowPathIcon className="w-3 h-3" /> Kembali: {new Date(p.tanggal_kembali).toLocaleDateString('id-ID')}
                                                        </div>
                                                    )}
                                                </div>
                                            </Td>
                                            <Td>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(p.status)}`}>
                                                    {p.status.replace('_', ' ')}
                                                </span>
                                            </Td>
                                            <Td center>
                                                <button
                                                    onClick={() => openDetail(p)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                                >
                                                    <InformationCircleIcon className="w-5 h-5" />
                                                </button>
                                            </Td>
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan={6} className="text-center py-20 text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <NoSymbolIcon className="w-10 h-10 mb-2" />
                                                <p>Riwayat tidak ditemukan.</p>
                                            </div>
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </div>
                </div>

                <div className="mt-8">
                    <Pagination links={peminjamans.links} />
                </div>
            </div>

            <DetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                data={selectedData}
            />
        </AppLayout>
    );
}