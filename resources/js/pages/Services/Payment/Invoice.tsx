import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    PlusIcon,
    CalendarIcon,
    PencilSquareIcon,
    NoSymbolIcon
} from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { MassSppForm } from "@/components/ui/Payment/Invoice/MassSppForm";
import { FilterDropdown, FilterItem } from '@/components/FilterDropdown';
import { SearchInput } from '@/components/SearchInput';
import { Pagination } from '@/components/Pagination';

// --- Interfaces ---
interface KategoriSpp { id: number; kategori_pembayaran: string; nominal: number; }
interface Mahasiswa { nama: string; nim: string; kelas: string; tahun_masuk: string; }
interface Tagihan { id: number; mahasiswa: Mahasiswa; jenis_tagihan: string[] | string; nominal: number; tanggal_jatuh_tempo: string; status: 'belum_bayar' | 'lunas'; }

interface Props {
    tagihans: {
        data: Tagihan[];
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
    kategori_spp: KategoriSpp[];
    tahun_masuk_list: string[];
    filters: {
        status?: string;
        tahun_masuk?: string;
        search?: string;
    };
}

export default function Invoice({ tagihans, kategori_spp, tahun_masuk_list, filters }: Props) {
    useFlashMessages();

    // --- State Management ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [params, setParams] = useState({
        status: filters.status || '',
        tahun_masuk: filters.tahun_masuk || '',
        search: filters.search || '',
    });

    const { data, setData, post, put, processing, reset, errors } = useForm({
        id: null as number | null,
        tahun_masuk: 'all',
        jenis_tagihan: [] as string[],
        nominal: 0,
        tanggal_jatuh_tempo: '',
        status: 'belum_bayar' as 'belum_bayar' | 'lunas',
    });

    // --- Logic Functions ---
    const updateData = (newParams: typeof params) => {
        router.get(route('payment.invoice'), newParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleSearch = (value: string) => {
        const newParams = { ...params, search: value };
        setParams(newParams);
        updateData(newParams);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        reset();
    };

    const openTambahModal = () => {
        setIsEditMode(false);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (tagihan: Tagihan) => {
        let jenis: string[] = [];
        if (Array.isArray(tagihan.jenis_tagihan)) {
            jenis = tagihan.jenis_tagihan;
        } else if (typeof tagihan.jenis_tagihan === 'string') {
            try { jenis = JSON.parse(tagihan.jenis_tagihan); } catch (e) { jenis = []; }
        }

        setIsEditMode(true);
        setData({
            id: tagihan.id,
            tahun_masuk: tagihan.mahasiswa.tahun_masuk,
            jenis_tagihan: jenis,
            nominal: tagihan.nominal,
            tanggal_jatuh_tempo: tagihan.tanggal_jatuh_tempo ? tagihan.tanggal_jatuh_tempo.substring(0, 10) : '',
            status: tagihan.status,
        });
        setIsModalOpen(true);
    };

    const submitTambah = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('payment.invoice.store_massal'), { onSuccess: closeModal });
    };

    const submitUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('payment.invoice.update', data.id), { onSuccess: closeModal });
    };

    const handleCheckboxChange = (val: string) => {
        setData((oldData: any) => {
            const updatedJenis = oldData.jenis_tagihan.includes(val)
                ? oldData.jenis_tagihan.filter((i: string) => i !== val)
                : [...oldData.jenis_tagihan, val];

            const newTotal = updatedJenis.reduce((acc: number, curr: string) => {
                const item = kategori_spp.find(s => s.kategori_pembayaran === curr);
                return acc + (item ? Number(item.nominal) : 0);
            }, 0);

            return { ...oldData, jenis_tagihan: updatedJenis, nominal: newTotal };
        });
    };

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const getPaymentStatusBadge = (status: string) => {
        const s = status?.toLowerCase();
        const styles = {
            lunas: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
            belum_bayar: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
            pending: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
        };
        return styles[s as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <AppLayout>
            <Head title="Tagihan Mahasiswa" />
            <div className="p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Tagihan Mahasiswa</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Daftar seluruh tagihan mahasiswa.</p>
                </div>

                {/* Filter & Action Section */}
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <SearchInput
                                value={params.search}
                                onChange={(e) => handleSearch(e.target.value)}
                                onSubmit={() => updateData(params)}
                                placeholder="Cari Nama atau NIM..."
                            />
                        </div>

                        <FilterDropdown
                            isOpen={isFilterOpen}
                            onOpenChange={setIsFilterOpen}
                            onReset={() => {
                                const resetParams = { status: '', tahun_masuk: '', search: '' };
                                setParams(resetParams);
                                updateData(resetParams);
                            }}
                        >
                            <FilterItem
                                label="Status"
                                value={params.status}
                                onValueChange={(val) => {
                                    const p = { ...params, status: val };
                                    setParams(p);
                                    updateData(p);
                                }}
                                options={[
                                    { label: 'Belum Bayar', value: 'belum_bayar' },
                                    { label: 'Lunas', value: 'lunas' },
                                ]}
                            />
                            <FilterItem
                                label="Tahun Masuk"
                                value={params.tahun_masuk}
                                onValueChange={(val) => {
                                    const p = { ...params, tahun_masuk: val };
                                    setParams(p);
                                    updateData(p);
                                }}
                                options={tahun_masuk_list.map(t => ({ label: t, value: t }))}
                            />
                        </FilterDropdown>
                    </div>

                    <Button onClick={openTambahModal} className="w-full md:w-auto h-11 md:h-10 rounded-xl font-bold">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Tambah Tagihan
                    </Button>
                </div>

                {/* Table Section */}
                <Table>
                    <Thead>
                        <Tr>
                            <Th center className="w-12">No</Th>
                            <Th>Mahasiswa</Th>
                            <Th>Angkatan</Th>
                            <Th>Jenis Tagihan</Th>
                            <Th>Nominal & Tempo</Th>
                            <Th>Status</Th>
                            <Th center>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {tagihans.data.length > 0 ? (
                            tagihans.data.map((t, i) => (
                                <Tr key={t.id}>
                                    <Td center>{i + 1 + (tagihans.current_page - 1) * tagihans.data.length}</Td>
                                    <Td>
                                        <div className="font-medium">{t.mahasiswa.nama}</div>
                                        <div className="text-xs text-gray-400">{t.mahasiswa.nim}</div>
                                    </Td>
                                    <Td>
                                        {t.mahasiswa.tahun_masuk}
                                    </Td>
                                    <Td>
                                        <div className="flex flex-wrap gap-1">
                                            {(Array.isArray(t.jenis_tagihan)
                                                ? t.jenis_tagihan
                                                : JSON.parse((t.jenis_tagihan as string) || '[]')
                                            ).map((j: string) => (
                                                <span
                                                    key={j}
                                                    className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold text-[10px] px-2 py-0.5 rounded border border-transparent dark:border-blue-800/50 uppercase"
                                                >
                                                    {j}
                                                </span>
                                            ))}
                                        </div>
                                    </Td>
                                    <Td>
                                        <div>{formatRupiah(t.nominal)}</div>
                                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 font-bold">
                                            <CalendarIcon className="w-3 h-3" />
                                            {new Date(t.tanggal_jatuh_tempo).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </Td>
                                    <Td>
                                        <span
                                            className={`px-2.5 py-1 font-bold rounded-full text-[10px] uppercase tracking-widest border ${getPaymentStatusBadge(
                                                t.status
                                            )}`}
                                        >
                                            {t.status.replace('_', ' ')}
                                        </span>
                                    </Td>
                                    <Td center>
                                        <Button variant="outline" size="sm" onClick={() => openEditModal(t)}>
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </Button>
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={7} className="text-center py-20 text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <NoSymbolIcon className="w-10 h-10 mb-2" />
                                        <p>Tidak ada data tagihan ditemukan</p>
                                    </div>
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
                {tagihans && tagihans.total > 0 && (
                    <Pagination meta={tagihans} />
                )}

                {/* Shared Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={isEditMode ? "Edit Tagihan" : "Tambah Tagihan Massal"}
                    footer={
                        <>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={closeModal}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                form="mass-spp-form"
                                className="flex-1"
                                disabled={processing}
                            >
                                {processing ? 'Memproses...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Tagihan')}
                            </Button>
                        </>
                    }
                >
                    <MassSppForm
                        isEdit={isEditMode}
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        tahunMasukList={tahun_masuk_list}
                        kategoriSpp={kategori_spp}
                        formatRupiah={formatRupiah}
                        handleCheckboxChange={handleCheckboxChange}
                        onCancel={closeModal}
                        onSubmit={isEditMode ? submitUpdate : submitTambah}
                    />
                </Modal>
            </div>
        </AppLayout>
    );
}