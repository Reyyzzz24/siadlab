import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    PlusIcon, PencilSquareIcon, TrashIcon,
    ArrowDownTrayIcon, ArrowPathIcon,
    NoSymbolIcon, InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { SearchInput } from '@/components/SearchInput';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { FilterDateItem, FilterDropdown } from '@/components/FilterDropdown';
import { OutgoingMailForm } from '@/components/ui/MailArchive/OutgoingMail/OutgoingMailForm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Pagination } from '@/components/Pagination';

interface Surat {
    id: number;
    no_agenda: string;
    no_surat: string;
    tanggal_surat: string;
    tujuan_surat: string;
    perihal: string;
    file_surat?: string;
    pengirim?: { id: number; name: string };
}

interface Props {
    suratKeluar: {
        data: Surat[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: { search?: string; tanggal_surat?: string };
    auth: { user: { role: string } };
    nextAgendaNumber: string;
}

export default function OutgoingMail({ suratKeluar, nextAgendaNumber, filters, auth }: Props) {
    useFlashMessages();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [params, setParams] = useState({
        search: filters.search || '',
        tanggal_surat: filters.tanggal_surat || '',
    });

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        id: '',
        no_agenda: '',
        no_surat: '',
        tanggal_surat: '',
        tujuan_surat: '',
        perihal: '',
        file: null as File | null,
    });

    const isAdminOrPetugas = ['admin', 'petugas'].includes(auth.user.role);

    const updateData = (newParams: typeof params) => {
        router.get(route('mail-archive.outgoing'), newParams, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newParams = { ...params, [name]: value };
        setParams(newParams);

        if (name !== 'search') updateData(newParams);
    };

    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? suratKeluar.data.map(s => s.id) : []);
    };

    const toggleSelectOne = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const openAddModal = () => {
        clearErrors();
        reset();
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (surat: Surat) => {
        clearErrors();
        setData({
            id: surat.id.toString(),
            no_agenda: surat.no_agenda,
            no_surat: surat.no_surat,
            tanggal_surat: surat.tanggal_surat,
            tujuan_surat: surat.tujuan_surat,
            perihal: surat.perihal,
            file: null,
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode) {
            post(route('mail-archive.update.outgoing', data.id), { forceFormData: true, onSuccess: () => setIsModalOpen(false) });
        } else {
            post(route('mail-archive.store.outgoing'), { onSuccess: () => { setIsModalOpen(false); reset(); } });
        }
    };

    const deleteSelected = () => {
        router.post(route('mail-archive.deleteSelected.outgoing', { folder: 'keluar' }), { ids: selectedIds }, { onSuccess: () => setSelectedIds([]) });
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <AppLayout>
            <Head title="Arsip Surat Keluar" />

            <div className="p-6">
                <header className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Surat Keluar</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kelola berkas surat yang dikirim.</p>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                        <div className="w-full sm:w-auto order-first">
                            <SearchInput value={params.search} onChange={handleFilterChange} onSubmit={() => updateData(params)} placeholder="Cari No. Surat / Tujuan..." className="w-full md:w-72" />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {isAdminOrPetugas && (
                                <ConfirmDeleteModal selectedCount={selectedIds.length} onConfirm={deleteSelected} isLoading={processing} />
                            )}

                            <div className="flex items-center gap-2">
                                <FilterDropdown isOpen={isFilterOpen} onOpenChange={setIsFilterOpen} onReset={() => { const resetParams = { ...params, tanggal_surat: '' }; setParams(resetParams); updateData(resetParams); }}>
                                    <FilterDateItem label="Tanggal Surat" value={params.tanggal_surat} onChange={(val) => { const newParams = { ...params, tanggal_surat: val }; setParams(newParams); updateData(newParams); }} />
                                </FilterDropdown>

                                <Button variant="outline" size="icon" className="h-10 w-10 text-gray-500 hover:text-cyan-600 shrink-0 border-gray-200 dark:border-gray-800" onClick={() => { const resetParams = { search: '', tanggal_surat: '' }; setParams(resetParams); updateData(resetParams); }} title="Reset Semua Filter">
                                    <ArrowPathIcon className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {isAdminOrPetugas && (
                        <div className="w-full md:w-auto">
                            <Button onClick={openAddModal} className="w-full md:w-auto justify-center"><PlusIcon className="w-4 h-4 mr-2" /> Tambah Surat</Button>
                        </div>
                    )}
                </div>

                <Table>
                    <Thead>
                        <Tr>
                            {isAdminOrPetugas && (
                                <Th className="w-12"><input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === suratKeluar.data.length && suratKeluar.data.length > 0} className="cursor-pointer" /></Th>
                            )}
                            <Th center>No</Th>
                            <Th>No Agenda</Th>
                            <Th>Tujuan & No Surat</Th>
                            <Th>Perihal</Th>
                            <Th center>Tanggal Surat</Th>
                            <Th center>Pengirim</Th>
                            <Th center>File</Th>
                            <Th center>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {suratKeluar.data.length > 0 ? suratKeluar.data.map((item, index) => (
                            <Tr key={`mail-out-${item.id}`} className="border-b border-gray-200 last:border-none hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                                {isAdminOrPetugas && (
                                    <Td className="pr-6"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelectOne(item.id)} className="cursor-pointer" /></Td>
                                )}
                                <Td center>{(suratKeluar.current_page - 1) * 10 + index + 1}</Td>
                                <Td className="font-medium">{item.no_agenda || '-'}</Td>
                                <Td>
                                    <div className="flex flex-col gap-0.5">
                                        {/* Nomor Surat sebagai judul utama */}
                                        <span className="font-medium text-gray-900 dark:text-white leading-tight">
                                            {item.tujuan_surat}
                                        </span>

                                        {/* Tujuan Surat sebagai sub-informasi dengan ikon */}
                                        <div className="flex items-center">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.no_surat}
                                            </span>
                                        </div>
                                    </div>
                                </Td>
                                <Td>{item.perihal}</Td>
                                <Td center>{formatDate(item.tanggal_surat)}</Td>
                                <Td center>
                                    <TooltipProvider delayDuration={100}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button className="focus:outline-none"><InformationCircleIcon className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors" /></button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="bg-slate-900 text-white border-none text-xs">
                                                <p>Pengirim: <span className="font-semibold">{item.pengirim?.name || '-'}</span></p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Td>
                                <Td center>
                                    {item.file_surat ? (
                                        <a href={route('mail-archive.mail.download', { id: item.id, type: 'outgoing' })} target="_blank" className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline">
                                            <ArrowDownTrayIcon className="h-4 w-4" />
                                        </a>
                                    ) : <span className="text-xs text-gray-400 italic">No File</span>}
                                </Td>
                                <Td center>
                                    {isAdminOrPetugas && (
                                        <Button variant="outline" size="sm" onClick={() => openEditModal(item)} className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"><PencilSquareIcon className="w-4 h-4" /></Button>
                                    )}
                                </Td>
                            </Tr>
                        )) : (
                            <Tr>
                                <Td colSpan={isAdminOrPetugas ? 10 : 9} className="text-center py-20 text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <NoSymbolIcon className="w-10 h-10 mb-2" />
                                        <p>Data surat tidak ditemukan</p>
                                    </div>
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
                <div className="mt-6 flex justify-center">
                    <Pagination links={suratKeluar.links} />
                </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Surat Keluar' : 'Tambah Surat Keluar'} footer={<>
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsModalOpen(false)} disabled={processing}>Batal</Button>
                    <Button
                        type="submit"
                        className="flex-1"
                        form="mail-form" disabled={processing} onClick={handleSubmit}>{processing ? 'Memproses...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Surat')}</Button>
                </>}>
                    <OutgoingMailForm data={data} setData={setData} errors={errors} isEditMode={isEditMode} nextAgendaNumber={nextAgendaNumber} processing={processing} onSubmit={handleSubmit} onCancel={() => { reset(); setIsModalOpen(false); }} />
                </Modal>
            </div>
        </AppLayout>
    );
}
