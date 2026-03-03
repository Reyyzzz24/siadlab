import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { PlusIcon, InboxStackIcon, CalendarIcon, NoSymbolIcon, ArrowPathRoundedSquareIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Modal } from "@/components/ui/modal";
import { LabLendingForm } from '@/components/ui/LabLending/LendNow/LabLendingForm';
import { ConfirmModal } from '@/components/ui/LabLending/LendNow/ConfirmModal';
import { ClockIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Laboratorium {
    id: number;
    id_lab: string;
    nama_lab: string;
    status?: string;
    lokasi?: string;
    kapasitas?: number;
    keterangan?: string;
}

interface Peminjaman {
    id: number;
    laboratorium?: Laboratorium;
    nama_peminjam: string;
    tanggal_pinjam: string;
    waktu_mulai?: string | null;
    waktu_selesai?: string | null;
    status: string;
    durasi_hari?: number;
    keperluan?: string;
    id_transaksi?: string;
    user?: {
        name: string;
    };
    petugas?: {
        id: number;
        name: string;
    };
    admin?: {
        id: number;
        name: string;
    };
}

interface Props {
    auth: { user: { name: string } };
    peminjamans: Peminjaman[];
    laboratoriesAvailable: Laboratorium[];
    totalTransactions?: number;
}

type FormData = {
    nama_peminjam: string;
    laboratorium_id: string;
    tanggal_pinjam: string;
    waktu_mulai?: string;
    waktu_selesai?: string;
    keperluan?: string;
};

export default function LendNow({ auth, peminjamans = [], laboratoriesAvailable = [], totalTransactions }: Props) {
    useFlashMessages();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant: 'destructive' | 'default';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'default'
    });

    const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

    const toggleSelect = (id: number) => {
        setSelectedIds((s) => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    };
    const selectAll = (items: Peminjaman[]) => {
        const selectable = items.filter(p => ['dipinjam', 'terlambat'].includes(p.status)).map(p => p.id);
        setSelectedIds(selectable);
    };
    const clearAll = () => setSelectedIds([]);

    const handleKembalikanSelected = () => {
        if (selectedIds.length === 0) return;

        setConfirmConfig({
            isOpen: true,
            title: 'Konfirmasi Pengembalian',
            message: `Apakah Anda yakin ingin mengajukan pengembalian untuk ${selectedIds.length} peminjaman yang dipilih?`,
            variant: 'default',
            onConfirm: () => {
                router.post('/lab-lending/kembalikan-selected', { ids: selectedIds }, {
                    onSuccess: () => { clearAll(); router.reload(); }
                });
            }
        });
    };

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        nama_peminjam: auth.user.name,
        laboratorium_id: '',
        tanggal_pinjam: '',
        waktu_mulai: '',
        waktu_selesai: '',
        keperluan: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/lab-lending/store', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
                router.reload();
            }
        });
    };
    const handleCancel = (id: number) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Batalkan Peminjaman',
            message: 'Anda akan membatalkan peminjaman ini. Lanjutkan?',
            variant: 'destructive',
            onConfirm: () => {
                router.post(`/lab-lending/${id}/cancel`, {}, {
                    onSuccess: () => {
                        closeConfirm();
                        router.reload();
                    }
                });
            }
        });
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
            <Head title="Peminjaman Lab" />
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">Peminjaman Laboratorium</h2>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Kelola peminjaman laboratorium.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sedang Dipinjam</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{peminjamans.filter(p => p.status === 'dipinjam').length} <span className="text-sm font-normal text-gray-400">Unit</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <InboxStackIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transaksi</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTransactions ?? peminjamans.length} <span className="text-sm font-normal text-gray-400">Transaksi</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                <CalendarIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-end items-stretch md:items-center gap-3 mb-6">
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Tambah Peminjaman
                    </Button>

                 {/*    {selectedIds.length > 0 && ( */}
                        <Button
                            variant="default"
                            onClick={handleKembalikanSelected}
                            className="w-full md:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300"
                        >
                            <ArrowPathRoundedSquareIcon className="w-5 h-5" />
                            Kembalikan ({selectedIds.length})
                        </Button>
                  {/*   )} */}
                </div>

                {/* --- DESKTOP TABLE VIEW --- */}
                <div className="hidden md:block">
                    <Table>
                        <Thead>
                            <Tr>
                                <Th center className="w-12"></Th>
                                <Th center>No</Th>
                                <Th>Laboratorium</Th>
                                <Th>Waktu</Th>
                                <Th>Status</Th>
                                <Th>Keperluan</Th>
                                <Th>Petugas</Th>
                                <Th>Aksi</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {peminjamans.length > 0 ? (
                                peminjamans.map((p, i) => (
                                    <Tr key={p.id}>
                                        <Td center>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(p.id)}
                                                disabled={!['dipinjam', 'terlambat'].includes(p.status)}
                                                onChange={() => toggleSelect(p.id)}
                                            />
                                        </Td>
                                        <Td center>{i + 1}</Td>
                                        <Td className="font-medium">{p.laboratorium?.nama_lab}</Td>
                                        <Td>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {new Date(p.tanggal_pinjam).toLocaleDateString('id-ID', {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <ClockIcon className="w-3 h-3" />
                                                    {p.waktu_mulai || '--:--'} {p.waktu_selesai ? ` - ${p.waktu_selesai}` : ''}
                                                </span>
                                            </div>
                                        </Td>
                                        <Td>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusBadge(p.status)}`}>
                                                {p.status.replace('_', ' ')}
                                            </span>
                                        </Td>
                                        <Td className='text-sm'>{p.keperluan || '-'}</Td>
                                        <Td>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{p.status === 'booked' ? 'Belum disetujui' : `Disetujui oleh: ${p.petugas?.name || p.admin?.name || '-'}`}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </Td>
                                        <Td>
                                            {p.status === 'booked' ? (
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
                                    <Td colSpan={8} className="text-center py-20 text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <NoSymbolIcon className="w-10 h-10 mb-2" />
                                            <p>Tidak ada peminjaman aktif</p>
                                        </div>
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>
                </div>

                {/* --- MOBILE CARD VIEW --- */}
                <div className="md:hidden space-y-4">
                    {peminjamans.length > 0 ? (
                        peminjamans.map((p) => (
                            <div key={p.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm relative">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-3">
                                        <input
                                            type="checkbox"
                                            className="mt-1"
                                            checked={selectedIds.includes(p.id)}
                                            disabled={!['dipinjam', 'terlambat'].includes(p.status)}
                                            onChange={() => toggleSelect(p.id)}
                                        />
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{p.laboratorium?.nama_lab}</h4>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                {new Date(p.tanggal_pinjam).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                <span className="mx-1">•</span>
                                                <ClockIcon className="w-3 h-3" />
                                                {p.waktu_mulai}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusBadge(p.status)}`}>
                                        {p.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 mb-3">
                                    <p className="text-xs text-gray-500 mb-1 font-medium">Keperluan:</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{p.keperluan || '-'}</p>
                                </div>

                                <div className="flex justify-between items-center pt-3">
                                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                        <InformationCircleIcon className="w-4 h-4" />
                                        <span>{p.status === 'booked' ? 'Menunggu Persetujuan' : (p.petugas?.name || 'Admin')}</span>
                                    </div>
                                    {p.status === 'booked' && (
                                        <button
                                            onClick={() => handleCancel(p.id)}
                                            className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                                        >
                                            Batalkan
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-gray-50 dark:bg-slate-900/50 rounded-xl border-2 border-gray-200 dark:border-slate-800">
                            <NoSymbolIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">Tidak ada peminjaman aktif.</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={closeConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                variant={confirmConfig.variant}
                confirmText={confirmConfig.variant === 'destructive' ? 'Ya, Batalkan' : 'Ya, Kembalikan'}
            />

            {/* cancel now uses ConfirmModal; RejectReasonModal removed */}

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Tambah Peminjaman Lab"
                footer={
                    <>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsAddModalOpen(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            form="lab-lending" // Harus sama dengan id <form> di LabForm
                            disabled={processing}
                        >
                            {processing ? 'Memproses...' : 'Simpan Peminjaman'}
                        </Button>
                    </>
                }
            >
                <LabLendingForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    onCancel={() => setIsAddModalOpen(false)}
                    laboratories={laboratoriesAvailable}
                />
            </Modal>
        </AppLayout>
    );
}
