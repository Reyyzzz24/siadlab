import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { PencilSquareIcon, NoSymbolIcon, PlusIcon } from '@heroicons/react/24/outline'; // Tambah PlusIcon
import { Button } from '@/components/ui/button';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { SearchInput } from '@/components/SearchInput';
import { ConfirmDeleteModal } from '@/components/ui/alert';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Modal } from '@/components/ui/modal'; // Pastikan import Modal
import { UserForm } from './Partials/UserForm'; // Pastikan import UserForm

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
}

interface Props {
    users: User[];
    filters?: { search?: string };
    auth?: { user?: { role?: string } };
}

export default function Users({ users = [], filters = {}, auth }: Props) {
    useFlashMessages();
    const [params, setParams] = useState({ search: filters?.search || '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const isAdmin = !!auth && auth.user?.role === 'admin';

    // Update useForm untuk Create Account
    const { data, setData, post, put, processing, errors, reset } = useForm({
        id: null as number | null,
        name: '',
        email: '',
        password: '',
        role: 'user',
    });

    const openCreateModal = () => {
        setIsEditMode(false);
        reset();
        setIsModalOpen(true);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setParams({ search: value });
        router.get(route('role.users'), { search: value }, { preserveState: true, replace: true, preserveScroll: true });
    };

    const openEditModal = (user: User) => {
        setIsEditMode(true);
        setData({
            id: user.id,
            name: user.name,
            email: user.email,
            password: '', // Password dikosongkan saat edit
            role: user.role || 'user',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('role.users.update', data.id), {
                onSuccess: () => { setIsModalOpen(false); reset(); },
            });
        } else {
            post(route('role.users.store'), {
                onSuccess: () => { setIsModalOpen(false); reset(); },
            });
        }
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('role.users.store'), { // Pastikan route ini ada di web.php
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };


    const deleteSelected = () => {
        router.delete(route('role.users.bulk-delete'), {
            data: { ids: selectedIds },
            onSuccess: () => setSelectedIds([]),
        });
    };

    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? users.map(u => u.id) : []);
    };

    const toggleSelectOne = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const availableRoles = ['admin', 'petugas', 'mahasiswa', 'user'];

    return (
        <AppLayout>
            <Head title="Users - Role Management" />
            <div className="p-6">
                <header className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Manajemen Role & User</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Atur peran dan buat akun pengguna baru.</p>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="w-full md:w-auto">
                        <SearchInput
                            value={params.search}
                            onChange={handleSearchChange}
                            onSubmit={() => router.get(route('role.users'), params)}
                            placeholder="Cari pengguna..."
                            className="w-full md:w-72"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        {isAdmin && selectedIds.length > 0 && (
                            <ConfirmDeleteModal
                                selectedCount={selectedIds.length}
                                onConfirm={deleteSelected}
                                isLoading={processing}
                            />
                        )}

                        {isAdmin && (
                            <Button
                                onClick={openCreateModal}
                                className="w-full md:w-auto gap-2 justify-center"
                            >
                                <PlusIcon className="w-4 h-4" />
                                <span>Tambah User</span>
                            </Button>
                        )}
                    </div>
                </div>

                <Table>
                    <Thead>
                        <Tr>
                            <Th className="w-12">
                                <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === users.length && users.length > 0} />
                            </Th>
                            <Th center>No</Th>
                            <Th>Nama</Th>
                            <Th>Email</Th>
                            <Th>Role</Th>
                            <Th center>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {users.length > 0 ? (
                            users.map((u, i) => (
                                <Tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                    <Td className="pr-6">
                                        <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelectOne(u.id)} />
                                    </Td>
                                    <Td center>{i + 1}</Td>
                                    <Td><div className="font-medium">{u.name}</div></Td>
                                    <Td>{u.email}</Td>
                                    <Td>{u.role}</Td>
                                    <Td center>
                                        {isAdmin && (
                                            <Button variant="outline" size="sm" onClick={() => openEditModal(u)}>
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={5} className="text-center py-20 text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <NoSymbolIcon className="w-10 h-10 mb-2" />
                                        <p>Tidak ada pengguna ditemukan</p>
                                    </div>
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); reset(); }}
                title={isEditMode ? "Edit Akun" : "Buat Akun Baru"}
                footer={
                    <div className="flex gap-3 w-full">
                        <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            className="flex-1"
                            form="user-form" // Harus sama dengan id di UserForm
                            disabled={processing}
                        >
                            {processing ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Buat Akun')}
                        </Button>
                    </div>
                }
            >
                <UserForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    onSubmit={handleSubmit}
                    isEditMode={isEditMode}
                    availableRoles={availableRoles}
                />
            </Modal>
        </AppLayout>
    );
}