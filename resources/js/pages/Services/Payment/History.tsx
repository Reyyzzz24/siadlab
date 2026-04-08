import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    FunnelIcon,
    InformationCircleIcon,
    MagnifyingGlassIcon,
    CalendarIcon, ArrowPathIcon,
    NoSymbolIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { FilterDropdown, FilterItem } from '@/components/FilterDropdown';
import { SearchInput } from '@/components/SearchInput';
import TransactionDetailModal from '@/components/ui/Payment/History/TransactionDetailModal';
import { Pagination } from '@/components/Pagination';

interface Pembayaran {
    id: number;
    id_transaksi?: string;
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
    keterangan?: string;
}

interface Props {
    pembayarans: {
        data: Pembayaran[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        current_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
        last_page?: number;
    };
    filters: {
        status?: string;
        kategori?: string;
        jenis_pembayaran?: string; // Tambahkan ini
        search?: string;
    };
}

export default function History({ pembayarans, filters }: Props) {
    useFlashMessages();
    const [search, setSearch] = useState(filters.search || '');

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<Pembayaran | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // State untuk Filter
    const [params, setParams] = useState({
        status: filters.status || '',
        kategori: filters.kategori || '',
        jenis_pembayaran: filters.jenis_pembayaran || '',
        search: filters.search || '',
    });

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(number);
    };

    const openDetail = (data: Pembayaran) => {
        setSelectedData(data);
        setIsDetailModalOpen(true);
    };

    const updateData = (newParams: any) => {
        router.get(route('payment.history'), newParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            // Optional: tambahkan processing untuk indikator loading
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
            <Head title="Riwayat Pembayaran" />

            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Riwayat Transaksi</h2>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Ringkasan kas, pendapatan, dan pengeluaran sistem.</p>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">

                        {/* SEARCH DI KIRI */}
                        <div className="w-full sm:w-64 order-first">
                            <SearchInput
                                placeholder="Cari transaksi..."
                                value={params.search}
                                onChange={(e) => handleSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        updateData(params);
                                    }
                                }}
                                onSubmit={() => updateData(params)} // Pastikan SearchInput memicu ini
                                className="w-full"
                            />
                        </div>

                        {/* FILTER & FAST RESET DI KANAN SEARCH */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="flex-1 sm:flex-none">
                                <FilterDropdown
                                    isOpen={isFilterOpen}
                                    onOpenChange={setIsFilterOpen}
                                    onReset={() => {
                                        const resetParams = { status: '', kategori: '', jenis_pembayaran: '', search: '' };
                                        setParams(resetParams);
                                        updateData(resetParams);
                                    }}
                                >
                                    {/*   <FilterItem
                                        label="Status"
                                        value={params.status}
                                        onValueChange={(val) => {
                                            setParams(prev => {
                                                const newParams = { ...prev, status: val };
                                                updateData(newParams);
                                                return newParams;
                                            });
                                        }}
                                        options={[
                                            { label: 'Lunas', value: 'lunas' },
                                            { label: 'Menunggu Konfirmasi', value: 'menunggu_konfirmasi' },
                                            { label: 'Ditolak', value: 'ditolak' },
                                        ]}
                                    /> */}
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

                            {/* FAST RESET BUTTON */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 text-gray-500 hover:text-cyan-600 shrink-0 border-gray-200"
                                onClick={() => {
                                    const resetParams = { status: '', kategori: '', jenis_pembayaran: '', search: '' };
                                    setParams(resetParams);
                                    updateData(resetParams);
                                }}
                                title="Reset Semua Filter"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    {/* --- TAMPILAN MOBILE: Muncul hanya di layar < 768px --- */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {pembayarans.data.length > 0 ? (
                            pembayarans.data.map((p) => (
                                <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-bold text-gray-800 dark:text-gray-100">
                                                {p.nama_pembayar || p.user?.name || '-'}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-mono tracking-wider">TRX: #{p.id_transaksi || p.id}</div>
                                        </div>
                                        <span className={`px-2 py-0.5 font-bold rounded-full text-[9px] uppercase tracking-widest border ${getPaymentStatusBadge(p.status)}`}>
                                            {p.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="space-y-2 border-t border-gray-50 dark:border-gray-700/50 pt-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 text-xs capitalize">{p.kategori.replace('_', ' ')}</span>
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">{formatRupiah(p.nominal)}</span>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] font-bold flex items-center gap-1.5 text-gray-400">
                                                <CalendarIcon className="w-3 h-3" /> Tagihan: {new Date(p.tanggal_tagihan).toLocaleDateString('id-ID')}
                                            </div>
                                            {p.tanggal_bayar && (
                                                <div className="text-[10px] font-bold flex items-center gap-1.5 text-green-500">
                                                    <CheckCircleIcon className="w-3 h-3" /> Bayar: {new Date(p.tanggal_bayar).toLocaleDateString('id-ID')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <button
                                            onClick={() => openDetail(p)}
                                            className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-all rounded-lg border border-gray-100 dark:border-gray-600"
                                        >
                                            <InformationCircleIcon className="w-4 h-4" /> Lihat Detail Transaksi
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-10 text-center border border-dashed border-gray-200 dark:border-gray-700">
                                <NoSymbolIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                <p className="text-gray-400 text-sm italic">Tidak ada data ditemukan</p>
                            </div>
                        )}
                        {pembayarans && pembayarans.total > 0 && (
                            <Pagination meta={pembayarans} />
                        )}
                    </div>

                    {/* --- TAMPILAN DESKTOP: Muncul hanya di layar >= 768px --- */}
                    <div className="hidden md:block">
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th center>No</Th>
                                    <Th>Nama Pembayar</Th>
                                    <Th>Kategori & Jenis</Th>
                                    <Th>Nominal & Tanggal</Th>
                                    <Th>Status</Th>
                                    <Th center>Detail</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {pembayarans.data.length > 0 ? (
                                    pembayarans.data.map((p, i) => (
                                        <Tr key={p.id}>
                                            <Td center>{i + 1 + (pembayarans.current_page - 1) * pembayarans.data.length}</Td>
                                            <Td>
                                                <div className="font-medium capitalize">{p.nama_pembayar}</div>
                                                <div className="text-xs text-gray-400">TRX: #{p.id_transaksi || p.id}</div>
                                            </Td>
                                            <Td>
                                                <div className="capitalize font-medium">{p.kategori.replace('_', ' ')}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{p.jenis_pembayaran}</div>
                                            </Td>
                                            <Td>
                                                <div className="font-medium text-blue-600 dark:text-blue-400">{formatRupiah(p.nominal)}</div>
                                                <div className="flex flex-col gap-0.5 mt-1">
                                                    <div className="text-[10px] font-bold flex items-center gap-1 text-gray-400">
                                                        <CalendarIcon className="w-2.5 h-2.5" /> {new Date(p.tanggal_tagihan).toLocaleDateString('id-ID')}
                                                    </div>
                                                    {p.tanggal_bayar && (
                                                        <div className="text-[10px] font-bold flex items-center gap-1 text-green-500 ">
                                                            <CheckCircleIcon className="w-2.5 h-2.5" /> {new Date(p.tanggal_bayar).toLocaleDateString('id-ID')}
                                                        </div>
                                                    )}
                                                </div>
                                            </Td>
                                            <Td>
                                                <span className={`px-2.5 py-1 font-bold rounded-full text-[10px] uppercase tracking-widest border ${getPaymentStatusBadge(p.status)}`}>
                                                    {p.status.replace('_', ' ')}
                                                </span>
                                            </Td>
                                            <Td center>
                                                <button
                                                    onClick={() => openDetail(p)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
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
                                                <p>Tidak ada data riwayat ditemukan</p>
                                            </div>
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                        {pembayarans && pembayarans.total > 0 && (
                            <Pagination meta={pembayarans} />
                        )}
                    </div>
                </div>
                <TransactionDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    data={selectedData}
                />
            </div>
        </AppLayout>
    );
}

