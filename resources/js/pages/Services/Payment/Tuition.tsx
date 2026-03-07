import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    PlusIcon,
    FunnelIcon,
    PencilSquareIcon,
    MagnifyingGlassIcon, ArrowPathIcon,
    NoSymbolIcon
} from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { SearchInput } from '@/components/SearchInput';
import { MasterSppForm } from "@/components/ui/Payment/Tuition/MasterSppForm";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { FilterDropdown, FilterItem } from '@/components/FilterDropdown'; // Gunakan dropdown standar

interface Spp {
    id: number;
    kategori_pembayaran: string;
    nominal: number;
    status: 'aktif' | 'tidak_aktif';
}

interface Props {
    spps: Spp[];
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Tuition({ spps, filters }: Props) {
    useFlashMessages();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // 1. State Lokal untuk Filter Reaktif
    const [params, setParams] = useState({
        search: filters.search || '',
        status: filters.status || '',
    });

    const { data, setData, post, put, processing, reset, errors } = useForm({
        id: null as number | null,
        kategori_pembayaran: '',
        nominal: 0,
        status: 'aktif' as 'aktif' | 'tidak_aktif',
    });

    // 2. Fungsi Sinkronisasi ke Server
    const updateData = (newParams: any) => {
        router.get(route('payment.tuition'), newParams, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    };

    const handleSearch = (value: string) => {
        const newParams = { ...params, search: value };
        setParams(newParams);
        updateData(newParams);
    };

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const openCreateModal = () => {
        reset();
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (spp: Spp) => {
        setData({
            id: spp.id,
            kategori_pembayaran: spp.kategori_pembayaran,
            nominal: spp.nominal,
            status: spp.status,
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                setIsModalOpen(false); // Menutup modal
                reset();               // Mengosongkan form
            },
        };

        if (isEditMode && data.id) {
            put(route('payment.tuition.update', data.id), options);
        } else {
            post(route('payment.tuition.store'), options);
        }
    };

    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? spps.map(s => s.id) : []);
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const deleteSelected = () => {
        router.post(route('payment.tuition.delete-selected'), { ids: selectedIds }, {
            onSuccess: () => setSelectedIds([])
        });
    };

    const getPaymentStatusBadge = (status: string) => {
        const s = status?.toLowerCase();

        const styles = {
            aktif: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
            tidak_aktif: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
        };

        // Default ke warna abu-abu jika status tidak dikenal
        return styles[s as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700';
    };

    return (
        <AppLayout>
            <Head title="Master SPP" />
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Biaya Akademik</h2>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Kelola kategori pembayaran dan nominal SPP</p>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        {/* 1. Search Input Sekarang di Kiri */}
                        <div className="w-full sm:w-auto order-first">
                            <SearchInput
                                placeholder="Cari kategori..."
                                className="w-full md:w-64"
                                value={params.search}
                                onChange={(e) => handleSearch(e.target.value)}
                                onSubmit={() => { }}
                            />
                        </div>

                        {/* 2. Group: Delete, Filter, dan Fast Reset */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <ConfirmDeleteModal
                                selectedCount={selectedIds.length}
                                onConfirm={deleteSelected}
                                isLoading={processing}
                            />

                            <div className="flex-1 sm:flex-none">
                                <FilterDropdown
                                    isOpen={isFilterOpen}
                                    onOpenChange={setIsFilterOpen}
                                    onReset={() => {
                                        const resetParams = { search: '', status: '' };
                                        setParams(resetParams);
                                        updateData(resetParams);
                                    }}
                                >
                                    <FilterItem
                                        label="Status"
                                        value={params.status || 'all'}
                                        onValueChange={(val) => {
                                            const newParams = { ...params, status: val === 'all' ? '' : val };
                                            setParams(newParams);
                                            updateData(newParams);
                                        }}
                                        options={[
                                            { label: 'Aktif', value: 'aktif' },
                                            { label: 'Tidak Aktif', value: 'tidak_aktif' },
                                        ]}
                                    />
                                </FilterDropdown>
                            </div>

                            {/* 3. Tombol Fast Reset */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 text-gray-500 hover:text-cyan-600 shrink-0"
                                onClick={() => {
                                    const resetParams = { search: '', status: '' };
                                    setParams(resetParams);
                                    updateData(resetParams);
                                }}
                                title="Reset All Filters"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="w-full md:w-auto justify-center"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Tambah Master SPP
                    </Button>
                </div>

                <Table>
                    <Thead>
                        <Tr>
                            <Th className="w-12">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300"
                                    onChange={toggleSelectAll}
                                    checked={selectedIds.length === spps.length && spps.length > 0}
                                />
                            </Th>
                            <Th center className="w-12">No</Th>
                            <Th>Kategori Pembayaran</Th>
                            <Th>Nominal</Th>
                            <Th>Status</Th>
                            <Th center>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {spps.length > 0 ? spps.map((spp, index) => (
                            <Tr key={spp.id}>
                                <Td>
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300"
                                        checked={selectedIds.includes(spp.id)}
                                        onChange={() => toggleSelect(spp.id)}
                                    />
                                </Td>
                                <Td center>{index + 1}</Td>
                                <Td>{spp.kategori_pembayaran}</Td>
                                <Td>{formatRupiah(spp.nominal)}</Td>
                                <Td>
                                    <span className={`px-2.5 py-1 font-bold rounded-full text-[10px] uppercase tracking-widest border ${getPaymentStatusBadge(spp.status)}`}>
                                        {spp.status.replace('_', ' ')}
                                    </span>
                                </Td>
                                <Td center>
                                    <Button variant='outline' size="sm" onClick={() => openEditModal(spp)}>
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </Button>
                                </Td>
                            </Tr>
                        )) : (
                            <Td colSpan={6} className="text-center py-20 text-gray-400">
                                <div className="flex flex-col items-center">
                                    <NoSymbolIcon className="w-10 h-10 mb-2" />
                                    <p>Data SPP tidak ditemukan</p>
                                </div>
                            </Td>
                        )}
                    </Tbody>
                </Table>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={isEditMode ? 'Edit SPP' : 'Tambah Master SPP'}
                    footer={
                        <>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsModalOpen(false)}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                form="tuition-form" // Harus sama dengan id <form> di ItemForm
                                disabled={processing}
                            >
                                {processing ? 'Memproses...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah SPP')}
                            </Button>
                        </>
                    }
                >
                    <MasterSppForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        isEditMode={isEditMode}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            </div>
        </AppLayout>
    );
}