import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { NoSymbolIcon } from '@heroicons/react/24/outline';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { SearchInput } from '@/components/SearchInput';
import { ConfirmDeleteModal } from '@/components/ui/alert';
import { useFlashMessages } from '@/hooks/useFlashMessages';

interface Student {
    id: number;
    nim: string;
    nama: string;
    program_studi: string;
    kelas: string;
    tahun_masuk: number;
    no_telepon: string;
    email: string;
}

interface Props {
    students: Student[];
    filters?: { search?: string };
}

export default function Students({ students = [], filters = {} }: Props) {
    useFlashMessages();
    const [params, setParams] = useState({ search: filters?.search || '' });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleSearchChange = (e: any) => {
        const { value } = e.target;
        setParams({ search: value });
        router.get(route('students.index'), { search: value }, { preserveState: true, replace: true });
    };

    const deleteSelected = () => {
        router.delete(route('students.bulk-delete'), {
            data: { ids: selectedIds },
            onSuccess: () => setSelectedIds([]),
        });
    };

    return (
        <AppLayout>
            <Head title="Daftar Mahasiswa" />
            <div className="p-6">
                <header className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Data Mahasiswa</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kelola informasi akademik mahasiswa SIADLAB.</p>
                </header>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                        <div className="w-full sm:w-auto order-first">
                            <SearchInput
                                value={params.search}
                                onChange={handleSearchChange}
                                onSubmit={() => router.get(route('students.index'), params)}
                                placeholder="Cari NIM atau Nama..."
                                className="w-full md:w-72"
                            />
                        </div>
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
                                    onChange={(e) => setSelectedIds(e.target.checked ? students.map(s => s.id) : [])}
                                    checked={selectedIds.length === students.length && students.length > 0}
                                />
                            </Th>
                            <Th>NIM</Th>
                            <Th>Nama</Th>
                            <Th>Prodi</Th>
                            <Th>Kelas</Th>
                            <Th center>Tahun</Th>
                            <Th>Telepon</Th>
                            <Th>Email</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {students.length > 0 ? (
                            students.map((s) => (
                                <Tr key={s.id}>
                                    <Td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(s.id)}
                                            onChange={() => setSelectedIds(prev => prev.includes(s.id) ? prev.filter(i => i !== s.id) : [...prev, s.id])}
                                        />
                                    </Td>
                                    <Td>{s.nim}</Td>
                                    <Td className="font-medium">{s.nama}</Td>
                                    <Td>{s.program_studi}</Td>
                                    <Td>{s.kelas}</Td>
                                    <Td center>{s.tahun_masuk}</Td>
                                    <Td>{s.no_telepon}</Td>
                                    <Td>{s.email}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={8} className="text-center py-20">
                                    <div className="flex flex-col items-center text-gray-400">
                                        <NoSymbolIcon className="w-10 h-10 mb-2" />
                                        <p>Mahasiswa tidak ditemukan</p>
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