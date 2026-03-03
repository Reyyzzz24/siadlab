import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    PlusIcon, MapPinIcon, ArrowPathIcon, NoSymbolIcon, PencilSquareIcon
} from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Modal } from '@/components/ui/modal';
import { LabForm } from '@/components/ui/LabLending/Laboratories/LabForm';
import { FilterDropdown, FilterItem } from '@/components/FilterDropdown';
import { SearchInput } from '@/components/SearchInput';
import { deleteSelected } from '@/actions/App/Http/Controllers/ItemLendingController';
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { Pagination } from '@/components/Pagination';
import * as XLSX from 'xlsx';

interface Lab {
    id: number;
    id_lab: string;
    nama_lab: string;
    lokasi?: string;
    kapasitas?: number;
    status?: string;
}

interface Props {
    labs: {
        data: Lab[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters?: { search?: string; status?: string };
    auth?: { user?: { role?: string } };
}

export default function Laboratories({
    labs = { data: [], links: [], current_page: 1, last_page: 1 },
    filters = {},
    auth
}: Props) {
    useFlashMessages();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [params, setParams] = useState({
        search: filters?.search || '',
        status: filters?.status || '',
    });

    const isAdminOrPetugas = !!auth && ['admin', 'petugas'].includes(auth.user?.role || '');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [importing, setImporting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        id: null as number | null,
        nama_lab: '',
        lokasi: '',
        kapasitas: '',
        status: 'available',
    });

    const openEditModal = (lab: Lab) => {
        setData('id', lab.id);
        setData('nama_lab', lab.nama_lab);
        setData('lokasi', lab.lokasi || '');
        setData('kapasitas', lab.kapasitas ? String(lab.kapasitas) : '');
        setData('status', lab.status || 'available');
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        reset();
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode && data.id) {
            put(route('lab-lending.labs.update', data.id), { onSuccess: () => setIsModalOpen(false) });
        } else {
            post(route('lab-lending.labs.store'), { onSuccess: () => setIsModalOpen(false) });
        }
    };
    const deleteSelected = () => {
        router.post(route('lab-lending.labs.deleteSelected'), { selected_ids: selectedIds }, {
            onSuccess: () => setSelectedIds([])
        });
    };

    const updateData = (newParams: typeof params) => {
        router.get(route('lab-lending.labs'), newParams, { preserveState: true, replace: true, preserveScroll: true });
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newParams = { ...params, [name]: value };
        setParams(newParams);
        if (name !== 'search') updateData(newParams);
    };

    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? labs.data.map(l => l.id) : []);
    };

    const toggleSelectOne = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const getStatusBadge = (status: string) => {
        const s = status?.toLowerCase();

        const styles = {
            maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50',
            available: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50',
            unavailable: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
        };

        return styles[s as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    };

    return (
        <AppLayout>
            <Head title="Laboratorium" />
            <div className="p-6">
                <header className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Laboratorium</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Daftar laboratorium.</p>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                        <div className="w-full sm:w-auto order-first">
                            <SearchInput
                                value={params.search}
                                onChange={(e: any) => handleFilterChange(e)}
                                onSubmit={() => updateData(params)}
                                placeholder="Cari laboratorium..."
                                className="w-full md:w-72"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {isAdminOrPetugas && (
                                <ConfirmDeleteModal
                                    selectedCount={selectedIds.length}
                                    onConfirm={deleteSelected}
                                    isLoading={processing}
                                />
                            )}
                            <div className="flex items-center gap-2">
                                <FilterDropdown isOpen={isFilterOpen} onOpenChange={setIsFilterOpen} onReset={() => { const resetParams = { ...params, status: '' }; setParams(resetParams); updateData(resetParams); }}>
                                    <FilterItem label="Status" value={params.status || 'all'} onValueChange={(val) => { const newParams = { ...params, status: val === 'all' ? '' : val }; setParams(newParams); updateData(newParams); }} options={[{ label: 'Available', value: 'available' }, { label: 'Unavailable', value: 'unavailable' }]} />
                                </FilterDropdown>

                                <Button variant="outline" size="icon" className="h-10 w-10 text-gray-500 hover:text-cyan-600 shrink-0" onClick={() => { const resetParams = { search: '', status: '' }; setParams(resetParams); updateData(resetParams); }} title="Reset All">
                                    <ArrowPathIcon className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {isAdminOrPetugas && (
                        <div className="w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                    const ws = XLSX.utils.json_to_sheet(labs.data.map(l => ({
                                        id: l.id,
                                        id_lab: l.id_lab,
                                        nama_lab: l.nama_lab,
                                        lokasi: l.lokasi,
                                        kapasitas: l.kapasitas,
                                        status: l.status,
                                    })));
                                    const wb = XLSX.utils.book_new();
                                    XLSX.utils.book_append_sheet(wb, ws, 'Laboratories');
                                    XLSX.writeFile(wb, 'laboratories_export.xlsx');
                                }}>Export Excel</Button>

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
                                                nama_lab: row.nama_lab || row.Nama || row['Nama Lab'] || '',
                                                lokasi: row.lokasi || row.Lokasi || '',
                                                kapasitas: Number(row.kapasitas || row.Kapasitas || 0),
                                                status: row.status || row.Status || 'available',
                                            };
                                            router.post(route('lab-lending.labs.store'), payload, {
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

                                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Import Excel</Button>

                                <Button className="w-full md:w-auto justify-center" onClick={openCreateModal}>
                                    <PlusIcon className="w-4 h-4 mr-2" /> Tambah Laboratorium
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full">
                    {/* --- TAMPILAN MOBILE: Lab Card Style (< 768px) --- */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {labs.data.length > 0 ? (
                            labs.data.map((l) => (
                                <div key={`card-${l.id}`} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                                    {/* Checkbox Floating (Hanya untuk Admin/Petugas) */}
                                    {isAdminOrPetugas && (
                                        <div className="absolute top-4 left-4 z-10">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={selectedIds.includes(l.id)}
                                                onChange={() => toggleSelectOne(l.id)}
                                            />
                                        </div>
                                    )}

                                    <div className={isAdminOrPetugas ? "pl-8" : ""}>
                                        {/* Header: Nama & Status */}
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-gray-100 capitalize leading-tight">
                                                    {l.nama_lab}
                                                </h3>
                                                <p className="text-[10px] text-gray-400 font-mono">ID: {l.id_lab}</p>
                                            </div>
                                            <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-widest ${getStatusBadge(l.status ?? 'default')}`}>
                                                {(l.status ?? 'unknown').replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        {/* Meta Info: Lokasi & Ikon (Meniru Tag/Calendar di Product) */}
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
                                            <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                                <MapPinIcon className="w-3.5 h-3.5" /> {l.lokasi || 'Tanpa Lokasi'}
                                            </div>
                                        </div>

                                        {/* Stats Box: Kapasitas & Informasi Tambahan */}
                                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase font-bold text-gray-400">Kapasitas</span>
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                                    {l.kapasitas ?? '0'} Orang
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {isAdminOrPetugas && (
                                            <div className="mt-3">
                                                <Button
                                                    variant="outline"
                                                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                                                    onClick={() => openEditModal(l)}
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" /> Edit Data Lab
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-10 text-center border border-dashed border-gray-200 dark:border-gray-700">
                                <NoSymbolIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm text-gray-400 italic">Laboratorium tidak ditemukan</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {labs.data.length > 0 && (
                            <div className="mt-6 flex justify-center">
                                <Pagination links={labs.links} />
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
                                                checked={selectedIds.length === labs.data.length && labs.data.length > 0}
                                            />
                                        </Th>
                                    )}
                                    <Th center className="w-16">No</Th>
                                    <Th>Nama Laboratorium</Th>
                                    <Th>Lokasi</Th>
                                    <Th center>Kapasitas</Th>
                                    <Th>Status</Th>
                                    {isAdminOrPetugas && <Th center>Aksi</Th>}
                                </Tr>
                            </Thead>
                            <Tbody>
                                {labs.data.length > 0 ? (
                                    labs.data.map((l, i) => (
                                        <Tr key={l.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                            {isAdminOrPetugas && (
                                                <Td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(l.id)}
                                                        onChange={() => toggleSelectOne(l.id)}
                                                    />
                                                </Td>
                                            )}
                                            <Td center>{(labs.current_page - 1) * 10 + i + 1}</Td>
                                            <Td>
                                                <div className="font-medium">{l.nama_lab}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">{l.id_lab}</div>
                                            </Td>
                                            <Td className='font-medium'>{l.lokasi || '-'}</Td>
                                            <Td center>{l.kapasitas ?? '-'}</Td>
                                            <Td>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold border uppercase tracking-widest ${getStatusBadge(l.status ?? 'default')}`}>
                                                    {(l.status ?? 'unknown').replace(/_/g, ' ')}
                                                </span>
                                            </Td>
                                            {isAdminOrPetugas && (
                                                <Td center>
                                                    <Button variant="outline" size="sm" onClick={() => openEditModal(l)}>
                                                        <PencilSquareIcon className="w-4 h-4" />
                                                    </Button>
                                                </Td>
                                            )}
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan={7} className="text-center py-20 text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <NoSymbolIcon className="w-10 h-10 mb-2" />
                                                <p>Tidak ada data laboratorium ditemukan</p>
                                            </div>
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                        <div className="mt-6 flex justify-center">
                            <Pagination links={labs.links} />
                        </div>
                    </div>
                </div>

                {isModalOpen && (
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title={isEditMode ? 'Edit Laboratorium' : 'Tambah Laboratorium'}
                        maxWidth="lg" // Tambahkan ini agar form tidak terlalu sempit
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
                                    form="lab-form" // Harus sama dengan id <form> di LabForm
                                    disabled={processing}
                                >
                                    {processing ? 'Memproses...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Laboratorium')}
                                </Button>
                            </>
                        }
                    >
                        <LabForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            isEditMode={isEditMode}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    </Modal>
                )}
            </div>
        </AppLayout>
    );
}
