import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { NoSymbolIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { SearchInput } from '@/components/SearchInput';
import { ConfirmDeleteModal } from '@/components/ui/alert';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Button } from "@/components/ui/button";
import { Modal } from '@/components/ui/modal';
import { AdminForm } from './Partials/AdminForm';

interface Admin {
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
    admins: Admin[];
    filters?: { search?: string };
    auth: { user: { role: string } };
}

export default function Administrators({ admins = [], filters = {}, auth }: Props) {
    useFlashMessages();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [params, setParams] = useState({ search: filters?.search || '' });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const isAdminOrPetugas = ['admin', 'petugas'].includes(auth.user.role);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        id: null as number | null,
        no_induk: '',
        nama: '',
        jabatan: '',
        bagian: '',
        no_telepon: '',
        email: '',
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setParams({ search: value });
        router.get(route('admins.index'), { search: value }, { preserveState: true, replace: true });
    };

    const deleteSelected = () => {
        router.delete(route('admins.bulk-delete'), {
            data: { ids: selectedIds },
            onSuccess: () => setSelectedIds([]),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('admins.update', data.id), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route('admins.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const openEditModal = (admin: Admin) => {
        setData({
            id: admin.id,
            no_induk: admin.no_induk ?? '', // Tambahkan safety null di sini juga
            nama: admin.nama ?? '',
            jabatan: admin.jabatan ?? '',
            bagian: admin.bagian ?? '',
            no_telepon: admin.no_telepon ?? '',
            email: admin.email ?? '',
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Administrator Sistem" />
            <div className="p-6">
                <header className="mb-6 flex items-center gap-3">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Administrator Sistem</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Daftar pengguna dengan hak akses penuh (Administrator).</p>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <SearchInput
                            value={params.search}
                            onChange={handleSearchChange}
                            onSubmit={() => router.get(route('admins.index'), params)}
                            placeholder="Cari admin..."
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
                            <Th className="w-12 text-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300"
                                    onChange={(e) => setSelectedIds(e.target.checked ? admins.map(a => a.id) : [])}
                                    checked={selectedIds.length === admins.length && admins.length > 0}
                                />
                            </Th>
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
                        {admins.length > 0 ? (
                            admins.map((admin) => (
                                <Tr key={admin.id}>
                                    <Td className="text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300"
                                            checked={selectedIds.includes(admin.id)}
                                            onChange={() => setSelectedIds(prev => prev.includes(admin.id) ? prev.filter(i => i !== admin.id) : [...prev, admin.id])}
                                        />
                                    </Td>
                                    <Td>
                                        {admin.no_induk}
                                    </Td>
                                    <Td>
                                        {admin.nama}
                                    </Td>
                                    <Td>
                                        {admin.jabatan}
                                    </Td>
                                    <Td> {admin.bagian}</Td>
                                    <Td className="text-sm">
                                        {admin.no_telepon}
                                    </Td>
                                    <Td>
                                        {admin.email}
                                    </Td>
                                    <Td center>
                                        {isAdminOrPetugas && (
                                            <div className="mt-3">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => openEditModal(admin)}
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
                                <Td colSpan={5} className="text-center py-20">
                                    <div className="flex flex-col items-center text-gray-400">
                                        <NoSymbolIcon className="w-10 h-10 mb-2" />
                                        <p>Belum ada data administrator</p>
                                    </div>
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? 'Edit Data Admin' : 'Tambah Admin'}
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
                            form="admin-form" // Harus sama dengan id di <form> pada AdminForm
                            disabled={processing}
                        >
                            {processing ? 'Memproses...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Admin')}
                        </Button>
                    </>
                }
            >
                <AdminForm
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