import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { NoSymbolIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { Pagination } from '@/components/Pagination';
import { SearchInput } from '@/components/SearchInput';
import { ConfirmDeleteModal } from '@/components/ui/alert';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Button } from "@/components/ui/button";
import { Modal } from '@/components/ui/modal';
import { StaffForm } from './Partials/StaffForm';

interface Staff {
    id: number;
    user_id: number;
    no_induk: string;
    nama: string;
    jabatan: string;
    bagian: string;
    no_telepon: string;
    email: string;
}

interface Props {
    staffs: any;
    filters?: { search?: string };
    auth: { user: { role: string } };
}

export default function Staff({ staffs = [], filters = {}, auth }: Props) {
    useFlashMessages();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [params, setParams] = useState({ search: filters?.search || '' });
    const perPage = 10;
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const isAdminOrPetugas = ['admin', 'petugas'].includes(auth.user.role);
    const items: Staff[] = Array.isArray(staffs) ? staffs : (staffs?.data ?? []);
    const links = !Array.isArray(staffs) && staffs?.links ? staffs.links : [];
    const meta = !Array.isArray(staffs) && staffs?.meta ? staffs.meta : null;
    const currentPage = meta ? meta.current_page : parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10);
    const currentPerPage = meta ? meta.per_page : perPage;
    const indexBase = (currentPage - 1) * currentPerPage;

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        id: null as number | null,
        no_induk: '',
        nama: '',
        jabatan: '',
        bagian: '',
        no_telepon: '',
        email: '',
    });

    const handleSearchChange = (e: any) => {
        const { value } = e.target;
        setParams({ search: value });
        router.get(route('staff.index'), { search: value }, { preserveState: true, replace: true });
    };

    const deleteSelected = () => {
        router.delete(route('staff.bulk-delete'), {
            data: { ids: selectedIds },
            onSuccess: () => setSelectedIds([]),
        });
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('staff.update', data.id), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route('staff.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const openEditModal = (staff: Staff) => {
        setData({
            id: staff.id,
            no_induk: staff.no_induk,
            nama: staff.nama,
            jabatan: staff.jabatan,
            bagian: staff.bagian,
            no_telepon: staff.no_telepon,
            email: staff.email,
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Data Staff" />
            <div className="p-6">
                <header className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Data Staff</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kelola informasi data staff dan bagian pengelola.</p>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                        <SearchInput
                            value={params.search}
                            onChange={handleSearchChange}
                            onSubmit={() => router.get(route('staff.index'), params)}
                            placeholder="Cari No. Induk atau Nama..."
                            className="w-full md:w-72"
                        />
                        {selectedIds.length > 0 && (
                            <ConfirmDeleteModal
                                selectedCount={selectedIds.length}
                                onConfirm={deleteSelected}
                            />
                        )}
                    </div>
                </div>

                <Table>
                    <Thead>
                        <Tr>
                            <Th className="w-12">
                                <input
                                    type="checkbox"
                                    onChange={(e) => setSelectedIds(e.target.checked ? items.map((s: Staff) => s.id) : [])}
                                    checked={selectedIds.length === items.length && items.length > 0}
                                />
                            </Th>
                            <Th center>No</Th>
                            <Th>No. Induk</Th>
                            <Th>Nama</Th>
                            <Th>Jabatan</Th>
                            <Th>Bagian</Th>
                            <Th>Telepon</Th>
                            <Th>Email</Th>
                            <Th center>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {items.length > 0 ? (
                            items.map((s: Staff) => (
                                <Tr key={s.id}>
                                    <Td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(s.id)}
                                            onChange={() => setSelectedIds(prev => prev.includes(s.id) ? prev.filter(i => i !== s.id) : [...prev, s.id])}
                                        />
                                    </Td>
                                    <Td center>{indexBase + items.indexOf(s) + 1}</Td>
                                    <Td>{s.no_induk}</Td>
                                    <Td className="font-medium text-gray-900 dark:text-white">{s.nama}</Td>
                                    <Td>{s.jabatan}</Td>
                                    <Td>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                            {s.bagian}
                                        </span>
                                    </Td>
                                    <Td>{s.no_telepon}</Td>
                                    <Td>{s.email}</Td>
                                    <Td center>
                                        {isAdminOrPetugas && (
                                            <div className="mt-3">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => openEditModal(s)}
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={9} className="text-center py-20">
                                    <div className="flex flex-col items-center text-gray-400">
                                        <NoSymbolIcon className="w-10 h-10 mb-2" />
                                        <p>Data staff tidak ditemukan</p>
                                    </div>
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
                {staffs && staffs.total > 0 && (
                    <Pagination meta={staffs} />
                )}
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? 'Edit Data Staff' : 'Tambah Staff'}
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
                            form="staff-form" // Pastikan ID ini sama dengan yang ada di komponen StaffForm
                            disabled={processing}
                        >
                            {processing ? 'Memproses...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Staff')}
                        </Button>
                    </>
                }
            >
                <StaffForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    isEditMode={isEditMode}
                    onSubmit={handleSubmit}
                />
            </Modal>
        </AppLayout>
    );
}   