import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { NoSymbolIcon } from '@heroicons/react/24/outline';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { Pagination } from '@/components/Pagination';
import { SearchInput } from '@/components/SearchInput';
import { ConfirmDeleteModal } from '@/components/ui/alert';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Button } from "@/components/ui/button";
import { Modal } from '@/components/ui/modal';
import { StudentForm } from './Partials/StudentForm';

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
    students: any;
    filters?: { search?: string };
    auth: { user: { role: string } };
}

export default function Students({ students = [], filters = {}, auth }: Props) {
    useFlashMessages();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [params, setParams] = useState({ search: filters?.search || '' });
    const perPage = 10;
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const isAdminOrPetugas = ['admin', 'petugas'].includes(auth.user.role);
    const items: Student[] = Array.isArray(students) ? students : (students?.data ?? []);
    const links = !Array.isArray(students) && students?.links ? students.links : [];
    const meta = !Array.isArray(students) && students?.meta ? students.meta : null;
    const currentPage = meta ? meta.current_page : parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10);
    const currentPerPage = meta ? meta.per_page : perPage;
    const indexBase = (currentPage - 1) * currentPerPage;

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        id: null as number | null,
        nim: '',
        nama: '',
        program_studi: '',
        kelas: '',
        tahun_masuk: '' as string | number,
        no_telepon: '',
        email: '',
    });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('students.update', data.id), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route('students.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const openEditModal = (student: Student) => {
        setData({
            id: student.id,
            nim: student.nim,
            nama: student.nama,
            program_studi: student.program_studi,
            kelas: student.kelas,
            tahun_masuk: student.tahun_masuk,
            no_telepon: student.no_telepon,
            email: student.email,
        });
        setIsEditMode(true);
        setIsModalOpen(true);
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
                                    onChange={(e) => setSelectedIds(e.target.checked ? items.map((s: Student) => s.id) : [])}
                                    checked={selectedIds.length === items.length && items.length > 0}
                                />
                            </Th>
                            <Th center>No</Th>
                            <Th>NIM</Th>
                            <Th>Nama</Th>
                            <Th>Prodi</Th>
                            <Th>Kelas</Th>
                            <Th center>Tahun</Th>
                            <Th>Telepon</Th>
                            <Th>Email</Th>
                            <Th center>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {items.length > 0 ? (
                            items.map((s: Student) => (
                                <Tr key={s.id}>
                                    <Td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(s.id)}
                                            onChange={() => setSelectedIds(prev => prev.includes(s.id) ? prev.filter(i => i !== s.id) : [...prev, s.id])}
                                        />
                                    </Td>
                                    <Td center>{indexBase + items.indexOf(s) + 1}</Td>
                                    <Td>{s.nim}</Td>
                                    <Td className="font-medium">{s.nama}</Td>
                                    <Td>{s.program_studi}</Td>
                                    <Td>{s.kelas}</Td>
                                    <Td center>{s.tahun_masuk}</Td>
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
                                <Td colSpan={10} className="text-center py-20">
                                    <div className="flex flex-col items-center text-gray-400">
                                        <NoSymbolIcon className="w-10 h-10 mb-2" />
                                        <p>Mahasiswa tidak ditemukan</p>
                                    </div>
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
                {students && students.total > 0 && (
                    <Pagination meta={students} />
                )}
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa'}
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
                            form="student-form" // Pastikan ID ini sama dengan yang ada di komponen StudentForm
                            disabled={processing}
                        >
                            {processing ? 'Memproses...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Mahasiswa')}
                        </Button>
                    </>
                }
            >
                <StudentForm
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