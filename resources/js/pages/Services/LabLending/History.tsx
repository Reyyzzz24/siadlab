import React, { Fragment, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { NoSymbolIcon, MagnifyingGlassIcon, ArrowPathIcon, XMarkIcon, CheckIcon, MinusIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { ClockIcon, UserIcon, ChevronDownIcon } from 'lucide-react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import DetailModal from '@/components/ui/LabLending/History/DetailModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilterDropdown, FilterItem } from '@/components/FilterDropdown';
import { Pagination } from '@/components/Pagination';

interface Peminjaman {
    id: number;
    laboratorium?: { nama_lab: string, id_lab: string };
    nama_peminjam: string;
    tanggal_pinjam: string;
    waktu_mulai?: string | null;
    waktu_selesai?: string | null;
    status: string;
    user?: {
        name: string;
    };
    id_transaksi?: string;
    keperluan?: string | null;
}

interface Props {
    peminjamans: {
        data: Peminjaman[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: { search?: string; status?: string };
}

export default function LendingList({ peminjamans, filters }: Props) {
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<Peminjaman | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');
    const [params, setParams] = useState({ status: filters?.status || '', search: filters?.search || '' });

    const updateData = (newParams: any) => {
        router.get(route('lab-lending.history'), newParams, { preserveState: true, preserveScroll: true, replace: true });
    };

    const openDetail = (data: Peminjaman) => {
        setSelectedData(data);
        setIsDetailModalOpen(true);
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

    const getStatusBadge = (status: string) => {
        const s = status?.toLowerCase();

        const styles = {
            booked: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
            dipinjam: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
            selesai: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
            terlambat: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
            ditolak: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40',
            proses_kembali: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50',
            disetujui: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50'
        };

        return styles[s as keyof typeof styles] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    const renderDuration = (waktuMulai?: string | null, waktuSelesai?: string | null) => {
        if (!waktuMulai || !waktuSelesai) return <span className="text-gray-400">-</span>;

        // Menangani format HH:mm atau HH:mm:ss
        const parseToMinutes = (timeStr: string) => {
            const parts = timeStr.split(':').map(Number);
            return parts[0] * 60 + parts[1];
        };

        const mulai = parseToMinutes(waktuMulai);
        const selesai = parseToMinutes(waktuSelesai);

        // Hitung selisih
        let diff = selesai - mulai;

        // Jika hasilnya negatif, berarti melewati tengah malam (tambah 24 jam/1440 menit)
        if (diff < 0) diff += 1440;

        if (diff === 0) return <span className="text-gray-400">0m</span>;

        const jam = Math.floor(diff / 60);
        const menit = diff % 60;

        return (
            <div className="flex items-baseline gap-0.5 font-medium">
                {jam > 0 && (
                    <>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{jam}</span>
                        <span className="text-[10px] text-gray-400 uppercase mr-1">j</span>
                    </>
                )}
                {menit > 0 && (
                    <>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{menit}</span>
                        <span className="text-[10px] text-gray-400 uppercase">m</span>
                    </>
                )}
            </div>
        );
    };
    return (
        <AppLayout>
            <Head title="History Peminjaman Lab" />
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">History Peminjaman Lab</h2>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Riwayat peminjaman laboratorium.</p>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input className="pl-9 w-full h-10" placeholder="Cari peminjam/lab..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </form>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="flex-1 sm:flex-none">
                                <FilterDropdown isOpen={isFilterOpen} onOpenChange={setIsFilterOpen} onReset={() => { setSearch(''); const resetParams = { status: '', search: '' }; setParams(resetParams); updateData(resetParams); }}>
                                    <FilterItem label="Status Peminjaman" value={params.status || 'all'} onValueChange={(val) => handleFilter('status', val === 'all' ? '' : val)} options={[
                                        { label: 'Dipinjam', value: 'dipinjam' },
                                        { label: 'Selesai', value: 'selesai' },
                                        { label: 'Terlambat', value: 'terlambat' },
                                        { label: 'Ditolak', value: 'ditolak' },
                                        { label: 'Proses Kembali', value: 'proses_kembali' },
                                    ]} />
                                </FilterDropdown>
                            </div>

                            <Button variant="outline" size="icon" className="h-10 w-10 text-gray-500 hover:text-cyan-600 shrink-0" onClick={() => { setSearch(''); const resetParams = { status: '', search: '' }; setParams(resetParams); updateData(resetParams); }} title="Reset All">
                                <ArrowPathIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    {/* --- TAMPILAN MOBILE: Card Style (< 768px) --- */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {peminjamans.data.length > 0 ? (
                            peminjamans.data.map((p) => (
                                <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg text-cyan-600 dark:text-cyan-400">
                                                <ComputerDesktopIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 dark:text-gray-100 capitalize">{p.laboratorium?.nama_lab}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">{p.laboratorium?.id_lab}</div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 font-bold rounded-full text-[9px] uppercase tracking-widest border ${getStatusBadge(p.status)}`}>
                                            {p.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="space-y-3 py-3 border-y border-gray-50 dark:border-gray-700/50">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-400">Peminjam:</span>
                                            <span className="font-medium">{p.nama_peminjam} <span className="text-[10px] text-gray-400">({p.user?.name})</span></span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-400">Waktu:</span>
                                            <div className="text-right">
                                                <div className="font-bold">{new Date(p.tanggal_pinjam).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                <div className="text-[10px] text-gray-500 flex items-center justify-end gap-1">
                                                    <ClockIcon className="w-3 h-3" /> {p.waktu_mulai || '--:--'} - {p.waktu_selesai || '--:--'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-400">Durasi:</span>
                                            <span className="font-mono text-cyan-600 dark:text-cyan-400">{renderDuration(p.waktu_mulai, p.waktu_selesai)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => openDetail(p)}
                                        className="w-full mt-3 py-2.5 flex items-center justify-center gap-2 text-xs font-bold bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-lg active:bg-cyan-50 dark:active:bg-cyan-900/20 active:text-cyan-600 transition-all border border-gray-100 dark:border-gray-600"
                                    >
                                        <InformationCircleIcon className="w-4 h-4" /> Detail Penggunaan Lab
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <NoSymbolIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm text-gray-400 italic">History lab tidak ditemukan</p>
                            </div>
                        )}
                        <div className="mt-6 flex justify-center">
                            <Pagination links={peminjamans.links} />
                        </div>
                    </div>

                    {/* --- TAMPILAN DESKTOP: Table Style (>= 768px) --- */}
                    <div className="hidden md:block">
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th center>No</Th>
                                    <Th>Peminjam</Th>
                                    <Th>Laboratorium</Th>
                                    <Th>Waktu</Th>
                                    <Th>Durasi</Th>
                                    <Th>Status</Th>
                                    <Th center>Detail</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {peminjamans.data.length > 0 ? (
                                    peminjamans.data.map((p, i) => (
                                        <Tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                            <Td center>{(peminjamans.current_page - 1) * 10 + i + 1}</Td>
                                            <Td>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{p.nama_peminjam}</span>
                                                    <span className="text-xs text-gray-400">User: {p.user?.name || 'Pengguna'}</span>
                                                </div>
                                            </Td>
                                            <Td>
                                                <div className="flex flex-col">
                                                    <span className="font-medium capitalize">{p.laboratorium?.nama_lab}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{p.laboratorium?.id_lab || ''}</span>
                                                </div>
                                            </Td>
                                            <Td>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {new Date(p.tanggal_pinjam).toLocaleDateString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    {(p.waktu_mulai || p.waktu_selesai) && (
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <ClockIcon className="w-3 h-3" />
                                                            {p.waktu_mulai || '--:--'} {p.waktu_selesai ? ` - ${p.waktu_selesai}` : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </Td>
                                            <Td>
                                                <div className="text-xs font-mono font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-1 rounded w-fit">
                                                    {renderDuration(p.waktu_mulai, p.waktu_selesai)}
                                                </div>
                                            </Td>
                                            <Td>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusBadge(p.status)}`}>
                                                    {p.status.replace('_', ' ')}
                                                </span>
                                            </Td>
                                            <Td center>
                                                <button
                                                    onClick={() => openDetail(p)}
                                                    className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-all"
                                                >
                                                    <InformationCircleIcon className="w-5 h-5" />
                                                </button>
                                            </Td>
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan={7} className="text-center py-20 text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <NoSymbolIcon className="w-10 h-10 mb-2" />
                                                <p>Tidak ada data riwayat ditemukan</p>
                                            </div>
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                        <div className="mt-6 flex justify-center">
                            <Pagination links={peminjamans.links} />
                        </div>
                    </div>
                </div>
                <DetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    data={selectedData}
                />
            </div>
        </AppLayout>
    );
}
