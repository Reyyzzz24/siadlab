import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { NoSymbolIcon } from '@heroicons/react/24/outline';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { SearchInput } from '@/components/SearchInput';
import { ConfirmDeleteModal } from '@/components/ui/alert';
import { useFlashMessages } from '@/hooks/useFlashMessages';

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
    staffs: Staff[];
    filters?: { search?: string };
}

export default function Staff({ staffs = [], filters = {} }: Props) {
    useFlashMessages();
    const [params, setParams] = useState({ search: filters?.search || '' });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
                                    onChange={(e) => setSelectedIds(e.target.checked ? staffs.map(s => s.id) : [])}
                                    checked={selectedIds.length === staffs.length && staffs.length > 0}
                                />
                            </Th>
                            <Th>No. Induk</Th>
                            <Th>Nama</Th>
                            <Th>Jabatan</Th>
                            <Th>Bagian</Th>
                            <Th>Telepon</Th>
                            <Th>Email</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {staffs.length > 0 ? (
                            staffs.map((s) => (
                                <Tr key={s.id}>
                                    <Td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(s.id)}
                                            onChange={() => setSelectedIds(prev => prev.includes(s.id) ? prev.filter(i => i !== s.id) : [...prev, s.id])}
                                        />
                                    </Td>
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
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={7} className="text-center py-20">
                                    <div className="flex flex-col items-center text-gray-400">
                                        <NoSymbolIcon className="w-10 h-10 mb-2" />
                                        <p>Data staff tidak ditemukan</p>
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