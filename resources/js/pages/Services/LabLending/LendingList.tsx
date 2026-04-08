import React, { Fragment, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { NoSymbolIcon, MagnifyingGlassIcon, ArrowPathIcon, XMarkIcon, CheckIcon, ClockIcon, MinusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { FilterDropdown, FilterItem } from '@/components/FilterDropdown';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/Pagination';
import RejectReasonModal from '@/components/ui/RejectReasonModal';

interface Peminjaman {
    id: number;
    laboratorium?: {
        nama_lab: string;
        id_lab: string;
    };
    user?: {
        name: string;
    };
    nama_peminjam: string;
    tanggal_pinjam: string;
    waktu_mulai?: string | null;
    waktu_selesai?: string | null;
    status: string;
    id_transaksi?: string; // Tambahkan ini
}

interface Props {
    peminjamans: {
        data: Peminjaman[];
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
        search?: string;
    };
}

export default function LendingList({ peminjamans, filters }: Props) {
    useFlashMessages();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');
    const [params, setParams] = useState({ status: filters?.status || '', search: filters?.search || '' });
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectPayload, setRejectPayload] = useState<{ id: number; path: string } | null>(null);

    const openRejectModal = (id: number, path: string) => {
        setRejectPayload({ id, path });
        setIsRejectModalOpen(true);
    };

    const submitRejectWithReason = (reason: string) => {
        if (!rejectPayload) return;
        router.post(rejectPayload.path, { alasan: reason }, { onSuccess: () => { setIsRejectModalOpen(false); setRejectPayload(null); router.reload(); } });
    };

    const updateData = (newParams: any) => {
        router.get(route('lab-lending.list'), newParams, { preserveState: true, preserveScroll: true, replace: true });
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
            ditolak: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
            proses_kembali: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50',
            disetujui: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50'
        };

        return styles[s as keyof typeof styles] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    return (
        <AppLayout>
            <Head title="Validasi Peminjaman Lab" />
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Validasi Peminjaman Lab</h2>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Daftar seluruh peminjaman laboratorium.</p>

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

                <Table>
                    <Thead>
                        <Tr>
                            <Th center>No</Th>
                            <Th>Peminjam</Th>
                            <Th>Laboratorium</Th>
                            <Th>Waktu</Th>
                            <Th>Status</Th>
                            <Th center>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {peminjamans.data.length > 0 ? (
                            peminjamans.data.map((p, i) => (
                                <Tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
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
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusBadge(p.status)}`}>
                                            {p.status.replace('_', ' ')}
                                        </span>
                                    </Td>
                                    <Td center>
                                        <div className="flex items-center justify-center gap-1">
                                            {(() => {
                                                // 1. Definisikan aksi berdasarkan status
                                                const getActions = () => {
                                                    switch (p.status) {
                                                        case 'booked':
                                                            return {
                                                                approvePath: `/lab-lending/${p.id}/approve`,
                                                                rejectPath: `/lab-lending/${p.id}/reject`,
                                                                approveTitle: "Setujui Peminjaman",
                                                                rejectTitle: "Tolak Peminjaman"
                                                            };
                                                        case 'proses_kembali':
                                                            return {
                                                                approvePath: `/lab-lending/${p.id}/approve-back`,
                                                                rejectPath: `/lab-lending/${p.id}/reject-back`,
                                                                approveTitle: "Setujui Pengembalian",
                                                                rejectTitle: "Tolak Pengembalian"
                                                            };
                                                        default:
                                                            return null;
                                                    }
                                                };

                                                const actions = getActions();

                                                // 2. Jika tidak ada aksi (selesai, ditolak, dipinjam), tampilkan minus
                                                if (!actions) {
                                                    return (
                                                        <span className="text-gray-400 text-xs">No Action</span>
                                                    );
                                                }

                                                // 3. Render tombol aksi
                                                return (
                                                    <div className="flex gap-1 animate-in fade-in zoom-in duration-200">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                            onClick={() => router.post(actions.approvePath, {}, { onSuccess: () => router.reload() })}
                                                            title={actions.approveTitle}
                                                        >
                                                            <CheckIcon className="w-5 h-5" />
                                                        </Button>

                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                            onClick={() => openRejectModal(p.id, actions.rejectPath)}
                                                            title={actions.rejectTitle}
                                                        >
                                                            <XMarkIcon className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                );
                                            })()}
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
                {peminjamans && peminjamans.total > 0 && (
                    <Pagination meta={peminjamans} />
                )}
            </div>
            <RejectReasonModal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} onSubmit={submitRejectWithReason} />
        </AppLayout>
    );
}
