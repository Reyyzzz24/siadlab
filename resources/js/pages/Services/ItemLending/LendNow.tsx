import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    PlusIcon,
    InformationCircleIcon,
    ClockIcon,
    CheckCircleIcon,
    ArrowPathRoundedSquareIcon,
    CalendarIcon,
    NoSymbolIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Modal } from "@/components/ui/modal";
import { AddLendingForm } from '@/components/ui/ItemLending/LendNow/AddLendingForm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmModal } from '@/components/ui/ItemLending/LendNow/ConfirmModal';

interface Barang {
    idbarang: string;
    namabarang: string;
    stok?: number;
}

interface Peminjaman {
    id: number;
    barang?: Barang;
    barang_id: string;
    namabarang?: string;
    tanggal_pinjam: string;
    tanggal_kembali: string | null;
    status: 'booked' | 'dipinjam' | 'kembali' | 'terlambat' | 'proses_kembali';
    jumlah: number;
    durasi_hari?: number;
    petugas?: { name: string; };
    admin?: { name: string; };
}

interface Props {
    auth: { user: { name: string; } };
    peminjamans: Peminjaman[];
    barangTersedia: Barang[];
    totalTransactions?: number;
}

export default function LendNow({ auth, peminjamans = [], barangTersedia = [], totalTransactions }: Props) {
    useFlashMessages();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: 'destructive' | 'default';
        action: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        variant: 'default',
        action: () => { }
    });

    const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_peminjam: auth.user.name,
        barang_id: '',
        jumlah: 1,
        tanggal_pinjam: '',
        tanggal_kembali: '',
    });

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleKembalikanSelected = () => {
        setConfirmConfig({
            isOpen: true,
            title: 'Konfirmasi Pengembalian',
            message: `Anda akan mengembalikan ${selectedIds.length} item secara bersamaan. Lanjutkan?`,
            variant: 'default',
            action: () => {
                router.post('/item-lending/kembalikan-selected', { ids: selectedIds }, {
                    onSuccess: () => {
                        setSelectedIds([]);
                        closeConfirm();
                    }
                });
            }
        });
    };

    const handleCancel = (id: number) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Batalkan Peminjaman',
            message: 'Anda akan membatalkan peminjaman ini. Lanjutkan?',
            variant: 'destructive',
            action: () => {
                router.post(`/item-lending/${id}/cancel`, {}, {
                    onSuccess: () => {
                        setSelectedIds([]);
                        closeConfirm();
                        router.reload();
                    }
                });
            }
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const selected = barangTersedia.find(b => String(b.idbarang) === String(data.barang_id));
        const jumlah = Number(data.jumlah || 1);
        if (selected && typeof selected.stok === 'number' && jumlah > selected.stok) {
            alert(`Jumlah yang Anda pinjam (${jumlah}) melebihi stok tersedia (${selected.stok}).`);
            return;
        }

        post('/item-lending/store', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
                router.reload();
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const currentStatus = status?.toLowerCase();
        const styles = {
            booked: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
            dipinjam: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
            kembali: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
            terlambat: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
        };
        return styles[currentStatus as keyof typeof styles] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    return (
        <AppLayout>
            <Head title="Peminjaman Barang" />
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Peminjaman Barang
                </h2>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    Kelola peminjaman sarana.
                </p>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sedang Dipinjam</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {peminjamans.filter(p => p.status === 'dipinjam').length} <span className="text-sm font-normal text-gray-400">Unit</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Hari Ini</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {totalTransactions ?? peminjamans.length} <span className="text-sm font-normal text-gray-400">Transaksi</span>
                                </p>
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
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
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

                   {/*  {selectedIds.length > 0 && ( */}
                        <Button
                            variant="default"
                            onClick={handleKembalikanSelected}
                            className="w-full md:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300"
                        >
                            <ArrowPathRoundedSquareIcon className="w-5 h-5" />
                            Kembalikan ({selectedIds.length})
                        </Button>
                 {/*    )} */}
                </div>

                {/* --- DESKTOP TABLE VIEW --- */}
                <div className="hidden md:block">
                    <Table>
                        <Thead>
                            <Tr>
                                <Th center className="w-12"></Th>
                                <Th center>No</Th>
                                <Th>Barang</Th>
                                <Th>Jumlah</Th>
                                <Th>Tgl Pinjam</Th>
                                <Th>Tgl Kembali</Th>
                                <Th>Status</Th>
                                <Th>Aksi</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {peminjamans.length > 0 ? (
                                peminjamans.map((p, i) => (
                                    <Tr key={p.id}>
                                        <Td><input type="checkbox" disabled={!['dipinjam', 'terlambat'].includes(p.status)} checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} /></Td>
                                        <Td center>{i + 1}</Td>
                                        <Td>
                                            <div className="flex flex-col">
                                                <span className="font-medium capitalize">{p.barang?.namabarang}</span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{p.barang?.idbarang}</span>
                                            </div>
                                        </Td>
                                        <Td>{p.jumlah}</Td>
                                        <Td>{new Date(p.tanggal_pinjam).toLocaleDateString('id-ID')}</Td>
                                        <Td>
                                            {p.tanggal_kembali
                                                ? new Date(p.tanggal_kembali).toLocaleDateString('id-ID')
                                                : <span className="text-gray-400 italic">Belum kembali</span>
                                            }
                                        </Td>
                                        <Td>
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(p.status)}`}>
                                                {p.status.replace('_', ' ')}
                                            </span>
                                        </Td>
                                        <Td>
                                            {p.status === 'booked' ? (
                                                <Button variant="destructive" size="sm" onClick={() => handleCancel(p.id)}>Batalkan</Button>
                                            ) : (
                                                <TooltipProvider><Tooltip><TooltipTrigger><InformationCircleIcon className="w-5 h-5 text-gray-400" /></TooltipTrigger><TooltipContent>{p.petugas?.name || 'Admin'}</TooltipContent></Tooltip></TooltipProvider>
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
                    {peminjamans.length > 0 ? peminjamans.map((p) => (
                        <div key={p.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-3">
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        disabled={!['dipinjam', 'terlambat'].includes(p.status)}
                                        checked={selectedIds.includes(p.id)}
                                        onChange={() => toggleSelect(p.id)}
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white capitalize leading-tight">
                                            {p.barang?.namabarang || p.namabarang}
                                        </h4>

                                        {/* Info Tanggal Pinjam & Kembali */}
                                        <div className="text-[11px] text-gray-500 mt-1 space-y-0.5">
                                            <p>Pinjam: {new Date(p.tanggal_pinjam).toLocaleDateString('id-ID')}</p>
                                            <p className="font-medium text-amber-600 dark:text-amber-400">
                                                Kembali: {p.tanggal_kembali ? new Date(p.tanggal_kembali).toLocaleDateString('id-ID') : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border shrink-0 ${getStatusBadge(p.status)}`}>
                                    {p.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-3">
                                <div className="flex flex-col">
                                    <span className="text-[11px] text-gray-400 italic">Durasi: {p.durasi_hari} Hari</span>
                                    <span className="text-[10px] text-gray-400">Jumlah: {p.jumlah} Unit</span>
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
                    )) : (
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
                onConfirm={confirmConfig.action}
                title={confirmConfig.title}
                message={confirmConfig.message}
                variant={confirmConfig.variant}
                isLoading={processing}
            />

            {/* Simple confirmation used for cancel action */}

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Tambah Peminjaman Barang"
                footer={
                    <>
                        <Button variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" className="flex-1" form="item-lending" disabled={processing}>
                            {processing ? 'Memproses...' : 'Simpan Peminjaman'}
                        </Button>
                    </>
                }
            >
                <AddLendingForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    barangTersedia={barangTersedia}
                    onSubmit={submit}
                    onCancel={() => setIsAddModalOpen(false)}
                    isEditMode={false}
                />
            </Modal>
        </AppLayout >
    );
}