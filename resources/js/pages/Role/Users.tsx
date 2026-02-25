import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { PencilSquareIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { SearchInput } from '@/components/SearchInput';
import { ConfirmDeleteModal } from '@/components/ui/alert';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    const isAdmin = !!auth && auth.user?.role === 'admin';
    const { put, processing } = useForm({ role: '' });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const updateRole = (id: number, role: string) => {
        router.put(route('role.users.update', id), { role }, {
            onSuccess: () => {
            },
            preserveScroll: true,
        });
    };

    const handleSearchChange = (e: any) => {
        const { value } = e.target;
        setParams({ search: value });
        router.get(route('role.users'), { search: value }, { preserveState: true, replace: true, preserveScroll: true });
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
                <header className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Manajemen Role</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Atur peran pengguna (hanya untuk admin).</p>
                </header>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                        <div className="w-full sm:w-auto order-first">
                            <SearchInput
                                value={params.search}
                                onChange={handleSearchChange}
                                onSubmit={() => router.get(route('role.users'), params)}
                                placeholder="Cari pengguna..."
                                className="w-full md:w-72"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {isAdmin && (
                                <ConfirmDeleteModal
                                    selectedCount={selectedIds.length}
                                    onConfirm={deleteSelected}
                                    isLoading={processing}
                                />
                            )}
                        </div>
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
                                    <Td>
                                        <div className="font-medium">{u.name}</div>
                                    </Td>
                                    <Td>{u.email}</Td>
                                    <Td>
                                        {isAdmin ? (
                                            <Select
                                                disabled={processing}
                                                defaultValue={u.role || ""}
                                                onValueChange={(value) => updateRole(u.id, value)}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="- Pilih Role -" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {availableRoles.map((r) => (
                                                            <SelectItem key={r} value={r}>
                                                                <span className="capitalize">{r}</span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="capitalize">{u.role || '-'}</div>
                                        )}
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={isAdmin ? 5 : 4} className="text-center py-20 text-gray-400">
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
        </AppLayout>
    );
}
