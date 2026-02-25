import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { NoSymbolIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { SearchInput } from '@/components/SearchInput';
import { ConfirmDeleteModal } from '@/components/ui/alert';
import { useFlashMessages } from '@/hooks/useFlashMessages';

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
}

export default function Administrators({ admins = [], filters = {} }: Props) {
    useFlashMessages();
    const [params, setParams] = useState({ search: filters?.search || '' });    
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
                            <Th>Jabatan / Bagian</Th>
                            <Th>Telepon</Th>
                            <Th>Email</Th>
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
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium">{admin.jabatan}</span>
                                            <span className="w-fit inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                                {admin.bagian}
                                            </span>
                                        </div>
                                    </Td>
                                    <Td className="text-sm">
                                        {admin.no_telepon}
                                    </Td>
                                    <Td>
                                        {admin.email}
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
        </AppLayout>
    );
}