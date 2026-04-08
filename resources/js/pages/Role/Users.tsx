import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { PencilSquareIcon, NoSymbolIcon, PlusIcon } from '@heroicons/react/24/outline'; // Tambah PlusIcon
import { Button } from '@/components/ui/button';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { Pagination } from '@/components/Pagination';
import { SearchInput } from '@/components/SearchInput';
import { ConfirmDeleteModal } from '@/components/ui/alert';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Modal } from '@/components/ui/modal'; // Pastikan import Modal
import { UserForm } from './Partials/UserForm'; // Pastikan import UserForm
import { TablePagination } from '@/components/ui/table-pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, Upload } from "lucide-react";

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
}

interface Props {
    users: any;
    filters?: { search?: string };
    auth?: { user?: { role?: string } };
}

export default function Users({ users = [], filters = {}, auth }: Props) {
    useFlashMessages();
    const [page, setPage] = useState(1);
    const perPage = 10;
    const items: User[] = Array.isArray(users) ? users : (users?.data ?? []);
    const links = !Array.isArray(users) && users?.links ? users.links : [];
    const meta = !Array.isArray(users) && users?.meta ? users.meta : null;
    const totalData = meta ? meta.total : items.length;
    const currentPage = meta ? meta.current_page : parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10);
    const currentPerPage = meta ? meta.per_page : perPage;
    const indexBase = (currentPage - 1) * currentPerPage;
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
        password_confirmation: '',
        role: 'user',
        nim: '',
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
            password_confirmation: '',
            role: user.role || 'user',
            nim: (user as any).mahasiswa?.nim || '',
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
        setSelectedIds(e.target.checked ? items.map((u: User) => u.id) : []);
    };

    const toggleSelectOne = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const availableRoles = ['admin', 'petugas', 'mahasiswa', 'user'];
    const [importing, setImporting] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv');

    const handleExport = (format: 'csv' | 'xlsx') => {
        const url = route('role.users.export', { format: format });
        window.location.href = url;
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Gunakan router.post dari @inertiajs/react
        router.post(route('role.users.import'), {
            file: file,
        }, {
            forceFormData: true, // Wajib diaktifkan karena kita mengirim file
            onStart: () => setImporting(true),
            onFinish: () => {
                setImporting(false);
                // Reset input file agar jika user pilih file yang sama lagi, event change tetap trigger
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
            onSuccess: () => {
                // Notifikasi success dari controller akan muncul secara otomatis
                console.log('Import berhasil');
            },
            onError: (errors) => {
                console.error('Import gagal', errors);
            },
        });
    };

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
                        {isAdmin && (
                            <>
                                {/* Bagian Import */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    className="hidden"
                                    onChange={handleImportChange}
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleImportClick}
                                    className="w-full md:w-auto gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    <span>Import</span>
                                </Button>

                                {/* Bagian Export dengan Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full md:w-auto gap-2">
                                            <Download className="h-4 w-4" />
                                            <span>Export</span>
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[150px]">
                                        <DropdownMenuItem
                                            onClick={() => handleExport('csv')} // Langsung kirim 'csv'
                                            className="cursor-pointer"
                                        >
                                            Export as CSV
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleExport('xlsx')} // Langsung kirim 'xlsx'
                                            className="cursor-pointer"
                                        >
                                            Export as Excel (.xlsx)
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>
                </div>

                <Table>
                    <Thead>
                        <Tr>
                            <Th className="w-12">
                                <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === items.length && items.length > 0} />
                            </Th>
                            <Th center>No</Th>
                            <Th>Nama</Th>
                            <Th>Email</Th>
                            <Th>Role</Th>
                            <Th center>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {items.length > 0 ? (
                            items.map((u: User, i: number) => (
                                <Tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                    <Td className="pr-6">
                                        <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelectOne(u.id)} />
                                    </Td>
                                    <Td center>{indexBase + i + 1}</Td>
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
                                <Td colSpan={6} className="text-center py-20 text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <NoSymbolIcon className="w-10 h-10 mb-2" />
                                        <p>Tidak ada pengguna ditemukan</p>
                                    </div>
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
                {users && users.total > 0 && (
                    <Pagination meta={users} />
                )}
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