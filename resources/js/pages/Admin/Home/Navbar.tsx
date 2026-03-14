import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { NavbarForm } from './NavbarForm/NavbarForm';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { SearchInput } from '@/components/SearchInput';
import { ConfirmDeleteModal } from '@/components/ui/alert';
import { NoSymbolIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface NavbarItem {
    id: number;
    title: string;
    url: string;
    parent_id: number | null;
    order_priority: number;
    is_active: boolean;
    target: string;
    icon: string | null;
}

interface Props {
    navbars: NavbarItem[];
    filters?: { search?: string };
    auth: { user: { role: string } };
}

export default function NavbarManagement({ navbars = [], filters = {}, auth }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingNavbar, setEditingNavbar] = useState<NavbarItem | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [params, setParams] = useState({ search: filters?.search || '' });

    const { data, setData, post, reset, processing, errors } = useForm({
        id: null as number | null,
        title: '',
        url: '',
        parent_id: null as number | null,
        order_priority: 0,
        is_active: true,
        target: '_self',
        icon: null as File | null,
    });

    const handleEdit = (navbar: NavbarItem) => {
        setData({
            id: navbar.id,
            title: navbar.title,
            url: navbar.url,
            parent_id: navbar.parent_id,
            order_priority: navbar.order_priority,
            is_active: navbar.is_active,
            target: navbar.target,
            icon: null,
        });
        setIsEditModalOpen(true); // Buka edit
        setIsCreateModalOpen(false); // Pastikan create tertutup
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const routeName = isEditModalOpen ? 'navbars.update' : 'navbars.store';

        // Sesuaikan route jika menggunakan update (biasanya butuh ID)
        const url = isEditModalOpen ? route(routeName, data.id) : route(routeName);

        post(url, {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const deleteSelected = () => {
        router.delete(route('admins.bulk-delete'), {
            data: { ids: selectedIds },
            onSuccess: () => setSelectedIds([]),
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setParams({ search: value });
        router.get(route('admin.home.navbars'), { search: value }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout>
            <Head title="Manajemen Navbar" />
            <div className="p-6">
                <header className="mb-6 flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Navbar</h1>
                        <p className="text-sm text-gray-500">Kelola daftar navbar yang ditampilkan di halaman utama.</p>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <SearchInput
                            value={params.search}
                            onChange={handleSearchChange}
                            onSubmit={() => router.get(route('admin.home.navbars'), params)}
                            placeholder="Cari navbar..."
                            className="w-full md:w-72"
                        />
                        {selectedIds.length > 0 && (
                            <ConfirmDeleteModal
                                selectedCount={selectedIds.length}
                                onConfirm={deleteSelected}
                            />
                        )}
                    </div>
                    <Button onClick={() => { reset(); setEditingNavbar(null); setIsCreateModalOpen(true); }} className="gap-2">
                        <Plus size={18} /> Tambah Navbar
                    </Button>
                </div>

                <Table>
                    <Thead>
                        <Tr>
                            <Th className="w-12 text-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300"
                                    onChange={(e) => setSelectedIds(e.target.checked ? navbars.map(e => e.id) : [])}
                                    checked={selectedIds.length === navbars.length && navbars.length > 0}
                                />
                            </Th>
                            <Th>Title</Th>
                            <Th>URL</Th>
                            <Th>Order</Th>
                            <Th>Status</Th>
                            <Th>Icon</Th>
                            <Th center>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {navbars.map((item) => (
                            <Tr key={item.id}>
                                <Td className="text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300"
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])}
                                    />
                                </Td>
                                <Td>{item.title}</Td>
                                <Td>{item.url}</Td>
                                <Td>{item.order_priority}</Td>
                                <Td>{item.is_active ? 'Aktif' : 'Nonaktif'}</Td>
                                <Td>{item.icon ? <img src={item.icon} alt="Icon" className="w-6 h-6" /> : '-'}</Td>
                                <Td center>
                                    <div className="flex justify-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}><PencilSquareIcon className="w-4 h-4" /></Button>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </div>

            <Modal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); reset(); }}
                title={isEditModalOpen ? "Edit Navbar" : "Tambah Navbar"}
                footer={
                    <div className="flex gap-2 w-full">
                        <Button variant="outline" className="flex-1" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); reset(); }} disabled={processing}>
                            Batal
                        </Button>
                        <Button onClick={handleSubmit} className="flex-1" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                }
            >
                <NavbarForm
                    isEdit={!!isEditModalOpen}
                    data={data}
                    setData={setData}
                    allMenus={navbars}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                />
            </Modal>
        </AppLayout>
    );
}