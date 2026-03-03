import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    PlusIcon, PencilSquareIcon, TagIcon, CalendarIcon, ArrowPathIcon,
    NoSymbolIcon
} from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { ItemForm } from "@/components/ui/ItemLending/Items/ItemForm";
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { FilterDropdown, FilterItem } from '@/components/FilterDropdown';
import { SearchInput } from '@/components/SearchInput';
import { items } from '@/routes/item-lending';
import { Pagination } from '@/components/Pagination';
import * as XLSX from 'xlsx';

interface Barang {
    idbarang: number;
    namabarang: string;
    kategori: string;
    status: string;
    hargabarang: number;
    tanggal_masuk: string;
    stok: number;
}

interface Props {
    barangs: {
        data: Barang[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        kategori?: string;
        status?: string;
        tanggal_masuk?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
    auth: { user: { role: string } };
}

export default function Items({ barangs = { data: [], links: [], current_page: 1, last_page: 1 }, filters = {}, auth }: Props) {
    useFlashMessages();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // State untuk Filter dengan Casting Type yang benar untuk TS
    const [params, setParams] = useState({
        search: filters.search || '',
        kategori: filters.kategori || '',
        status: filters.status || '',
        tanggal_masuk: filters.tanggal_masuk || '',
        sort: filters.sort || 'idbarang',
        direction: (filters.direction as 'asc' | 'desc') || 'asc',
    });

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        idbarang: null as number | null,
        namabarang: '',
        kategori: '',
        status: '',
        tanggal_masuk: '',
        stok: 0,
        hargabarang: 0,
    });

    const isAdminOrPetugas = ['admin', 'petugas'].includes(auth.user.role);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [importing, setImporting] = useState(false);

    const updateData = (newParams: typeof params) => {
        router.get(route('item-lending.items'), newParams, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newParams = { ...params, [name]: value };
        setParams(newParams);

        if (name !== 'search') {
            updateData(newParams);
        }
    };

    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? barangs.data.map(b => b.idbarang) : []);
    };

    const toggleSelectOne = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const openEditModal = (barang: Barang) => {
        setData({
            idbarang: barang.idbarang,
            namabarang: barang.namabarang,
            kategori: barang.kategori,
            status: barang.status,
            stok: barang.stok,
            hargabarang: barang.hargabarang,
            tanggal_masuk: barang.tanggal_masuk ? barang.tanggal_masuk.split('T')[0] : '',
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('item-lending.items.update', data.idbarang), { onSuccess: () => setIsModalOpen(false) });
        } else {
            post(route('item-lending.items.store'), { onSuccess: () => setIsModalOpen(false) });
        }
    };
    const deleteSelected = () => {
        router.post(route('item-lending.items.deleteSelected'),
            {
                selected_ids: selectedIds
            },
            {
                onSuccess: () => setSelectedIds([])
            });
    };
    useEffect(() => {
        // Cek apakah ada perubahan dibanding filter awal
        const isChanged = params.status !== (filters.status || "") ||
            params.kategori !== (filters.kategori || "");

        if (isChanged) {
            updateData(params);
        }
    }, [params.status, params.kategori]);

    const getStatusBadge = (status: string) => {
        const styles = {
            dipinjam: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
            booked: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
            unavailable: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40',
            available: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50',
        };

        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    return (
        <AppLayout>
            <Head title="Katalog Barang" />
            <div className="p-6">
                <header className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Daftar Barang</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Daftar Semua Barang.</p>
                </header>
                {/* Container Utama: Default kolom (mobile), Baris pada Medium screen ke atas */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">

                    {/* Group Kiri: Filter & Search */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                        {/* 1. Search Input: Sekarang di paling kiri */}
                        <div className="w-full sm:w-auto order-first">
                            <SearchInput
                                value={params.search}
                                onChange={handleFilterChange}
                                onSubmit={() => updateData(params)}
                                placeholder="Cari Barang..."
                                className="w-full md:w-72"
                            />
                        </div>

                        {/* 2. Wrapper untuk Action Buttons (Delete, Filter, Reset) */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {isAdminOrPetugas && (
                                <ConfirmDeleteModal
                                    selectedCount={selectedIds.length}
                                    onConfirm={deleteSelected}
                                    isLoading={processing}
                                />
                            )}

                            <div className="flex items-center gap-2">
                                <FilterDropdown
                                    isOpen={isFilterOpen}
                                    onOpenChange={setIsFilterOpen}
                                    onReset={() => {
                                        const resetParams = { ...params, kategori: '', status: '' };
                                        setParams(resetParams);
                                        updateData(resetParams);
                                    }}
                                >
                                    <FilterItem
                                        label="Kategori"
                                        value={params.kategori || 'all'}
                                        onValueChange={(val) => {
                                            const newParams = { ...params, kategori: val === 'all' ? '' : val };
                                            setParams(newParams);
                                            updateData(newParams);
                                        }}
                                        options={[
                                            { label: 'Elektronik', value: 'elektronik' },
                                            { label: 'Kendaraan', value: 'kendaraan' },
                                            { label: 'Furnitur', value: 'furnitur' },
                                            { label: 'Peralatan', value: 'peralatan' },
                                        ]}
                                    />
                                    <FilterItem
                                        label="Status"
                                        value={params.status || 'all'}
                                        onValueChange={(val) => {
                                            const newParams = { ...params, status: val === 'all' ? '' : val };
                                            setParams(newParams);
                                            updateData(newParams);
                                        }}
                                        options={[
                                            { label: 'Tersedia', value: 'available' },
                                            { label: 'Dipinjam', value: 'dipinjam' },
                                            { label: 'Rusak', value: 'rusak' },
                                            { label: 'Booked', value: 'booked' },
                                        ]}
                                    />
                                </FilterDropdown>

                                {/* 3. Tombol Fast Reset (Action Cepat tanpa buka Modal) */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 text-gray-500 hover:text-cyan-600 shrink-0 border-gray-200 dark:border-gray-800"
                                    onClick={() => {
                                        const resetParams = { ...params, search: '', kategori: '', status: '' };
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

                    {/* Button Tambah: Akan pindah ke bawah Search di mobile */}
                    {isAdminOrPetugas && (
                        <div className="w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                    const ws = XLSX.utils.json_to_sheet(barangs.data.map(b => ({
                                        idbarang: b.idbarang,
                                        namabarang: b.namabarang,
                                        kategori: b.kategori,
                                        status: b.status,
                                        stok: b.stok,
                                        hargabarang: b.hargabarang,
                                        tanggal_masuk: b.tanggal_masuk,
                                    })));
                                    const wb = XLSX.utils.book_new();
                                    XLSX.utils.book_append_sheet(wb, ws, 'Barangs');
                                    XLSX.writeFile(wb, 'barangs_export.xlsx');
                                }}>
                                    Export Excel
                                </Button>

                                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setImporting(true);
                                    const reader = new FileReader();
                                    reader.onload = (evt) => {
                                        const data = evt.target?.result as ArrayBuffer | string;
                                        const wb = XLSX.read(data, { type: typeof data === 'string' ? 'binary' : 'array' });
                                        const wsname = wb.SheetNames[0];
                                        const ws = wb.Sheets[wsname];
                                        const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
                                        Promise.all(json.map(row => new Promise<void>((res) => {
                                            const payload = {
                                                namabarang: row.namabarang || row.Nama || row['Nama Barang'] || row.namabarang,
                                                kategori: row.kategori || row.Kategori || '',
                                                status: row.status || row.Status || 'available',
                                                stok: Number(row.stok || row.Stok || 0),
                                                hargabarang: Number(row.hargabarang || row.Harga || 0),
                                                tanggal_masuk: row.tanggal_masuk || row['Tanggal Masuk'] || '',
                                            };
                                            router.post(route('item-lending.items.store'), payload, {
                                                onSuccess: () => res(),
                                                onError: () => res()
                                            });
                                        }))).then(() => {
                                            setImporting(false);
                                            updateData(params);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        });
                                    };
                                    reader.readAsArrayBuffer(file);
                                }} />

                                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                    Import Excel
                                </Button>

                                <Button variant="default" size="sm" onClick={() => { reset(); setIsEditMode(false); setIsModalOpen(true); }} className="w-full md:w-auto justify-center"> 
                                    <PlusIcon className="w-4 h-4 mr-2" /> Tambah Barang
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full">
                    {/* --- TAMPILAN MOBILE: Product Card Style (< 768px) --- */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {barangs.data.length > 0 ? (
                            barangs.data.map((barang) => (
                                <div key={`card-${barang.idbarang}`} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative">
                                    {/* Checkbox Floating */}
                                    {isAdminOrPetugas && (
                                        <div className="absolute top-4 left-4 z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(barang.idbarang)}
                                                onChange={() => toggleSelectOne(barang.idbarang)}
                                            />
                                        </div>
                                    )}

                                    <div className={isAdminOrPetugas ? "pl-8" : ""}>
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-gray-100 capitalize leading-tight">
                                                    {barang.namabarang}
                                                </h3>
                                                <p className="text-[10px] text-gray-400 font-mono">ID: {barang.idbarang}</p>
                                            </div>
                                            <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-widest ${getStatusBadge(barang.status)}`}>
                                                {barang.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
                                            <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                                <TagIcon className="w-3.5 h-3.5" /> {barang.kategori}
                                            </div>
                                            <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                                <CalendarIcon className="w-3.5 h-3.5" /> {new Date(barang.tanggal_masuk).toLocaleDateString('id-ID')}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase font-bold text-gray-400">Stok</span>
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{barang.stok} Unit</span>
                                            </div>
                                            <div className="flex flex-col text-right">
                                                <span className="text-[9px] uppercase font-bold text-gray-400">Harga Satuan</span>
                                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                    Rp {new Intl.NumberFormat('id-ID').format(barang.hargabarang)}
                                                </span>
                                            </div>
                                        </div>

                                        {isAdminOrPetugas && (
                                            <div className="mt-3">
                                                <Button
                                                    variant="outline"
                                                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                                                    onClick={() => openEditModal(barang)}
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" /> Edit Barang
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-10 text-center border border-dashed border-gray-200 dark:border-gray-700">
                                <NoSymbolIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm text-gray-400 italic">Data inventaris kosong</p>
                            </div>
                        )}
                    </div>

                    {/* --- TAMPILAN DESKTOP: Table Style (>= 768px) --- */}
                    <div className="hidden md:block">
                        <Table>
                            <Thead>
                                <Tr>
                                    {isAdminOrPetugas && (
                                        <Th className="w-12">
                                            <input
                                                type="checkbox"
                                                onChange={toggleSelectAll}
                                                checked={selectedIds.length === barangs.data.length && barangs.data.length > 0}
                                            />
                                        </Th>
                                    )}
                                    <Th center className="w-16">No</Th>
                                    <Th>Nama Barang</Th>
                                    <Th>Kategori</Th>
                                    <Th center>Tanggal Masuk</Th>
                                    <Th>Status</Th>
                                    <Th center>Stok</Th>
                                    <Th>Harga Barang</Th>
                                    {isAdminOrPetugas && <Th center>Aksi</Th>}
                                </Tr>
                            </Thead>
                            <Tbody>
                                {barangs.data.length > 0 ? (
                                    barangs.data.map((barang, i) => (
                                        <Tr key={`item-${barang.idbarang}`} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                            {isAdminOrPetugas && (
                                                <Td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(barang.idbarang)}
                                                        onChange={() => toggleSelectOne(barang.idbarang)}
                                                    />
                                                </Td>
                                            )}
                                            <Td center>{(barangs.current_page - 1) * 10 + i + 1}</Td>
                                            <Td>
                                                <div className="flex flex-col">
                                                    <span className="font-medium capitalize">{barang.namabarang}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{barang.idbarang}</span>
                                                </div>
                                            </Td>
                                            <Td>{barang.kategori}</Td>
                                            <Td center>
                                                {new Date(barang.tanggal_masuk).toLocaleDateString('id-ID', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric'
                                                }).replace(/\//g, '-')}
                                            </Td>
                                            <Td>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-widest ${getStatusBadge(barang.status)}`}>
                                                    {barang.status.replace('_', ' ')}
                                                </span>
                                            </Td>
                                            <Td center>
                                                {barang.stok}
                                            </Td>
                                            <Td>
                                                Rp {new Intl.NumberFormat('id-ID').format(barang.hargabarang)}
                                            </Td>
                                            {isAdminOrPetugas && (
                                                <Td center>
                                                    <Button variant="outline" size="sm" onClick={() => openEditModal(barang)}>
                                                        <PencilSquareIcon className="w-4 h-4" />
                                                    </Button>
                                                </Td>
                                            )}
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan={9} className="text-center py-20 text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <NoSymbolIcon className="w-10 h-10 mb-2" />
                                                <p>Barang Tidak Tersedia</p>
                                            </div>
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                        <div className="mt-6 flex justify-center">
                            <Pagination links={barangs.links} />
                        </div>
                    </div>
                </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Barang' : 'Tambah Barang'}
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
                                form="item-form" // Harus sama dengan id <form> di ItemForm
                                disabled={processing}
                            >
                                {processing ? 'Memproses...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Barang')}
                            </Button>
                        </>
                    }
                >
                    <ItemForm data={data} setData={setData} errors={errors} processing={processing} isEditMode={isEditMode} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            </div>
        </AppLayout>
    );
}