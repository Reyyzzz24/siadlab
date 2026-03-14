import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { HeroSection } from '@/types'; // Sesuaikan dengan tipe data Anda
import { Plus, Edit2, Trash2, Image as ImageIcon, Link2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { HeroSectionForm } from './HeroSection/HeroSectionForm';
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { SearchInput } from '@/components/SearchInput';
import { ConfirmDeleteModal } from '@/components/ui/alert';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { NoSymbolIcon, PencilSquareIcon } from '@heroicons/react/24/outline';


interface Props {
    heroSections: HeroSection[];
    filters?: { search?: string };
    auth: { user: { role: string } };
}

export default function HeroSectionManagement({ heroSections = [], filters = {}, auth }: Props) {
    useFlashMessages();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHero, setEditingHero] = useState<HeroSection | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [params, setParams] = useState({ search: filters?.search || '' });

    const { data, setData, post, reset, processing, errors } = useForm({
        title: '',
        subtitle: '',
        image_path: null as File | null,
        cta_text: '',
        cta_link: '',
        position: 0,
        is_active: true,
    });

    const deleteSelected = () => {
        router.delete(route('hero-sections.bulk-destroy'), {
            data: { ids: selectedIds },
            onSuccess: () => setSelectedIds([]),
        });
    };

    const handleEdit = (hero: HeroSection) => {
        setEditingHero(hero);
        setData({
            title: hero.title,
            subtitle: hero.subtitle || '',
            image_path: null,
            cta_text: hero.cta_text || '',
            cta_link: hero.cta_link || '',
            position: hero.position,
            is_active: hero.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingHero ? route('hero-sections.update', editingHero.id) : route('hero-sections.store');

        post(url, {
            forceFormData: true,
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setParams({ search: value });
        router.get(route('admin.home.hero-sections'), { search: value }, { preserveState: true, replace: true });
    };


    return (
        <AppLayout>
            <Head title="Manajemen Hero Section" />

            <div className="p-6">
                <header className="mb-6 flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Hero</h1>
                        <p className="text-sm text-gray-500">Kelola daftar hero yang ditampilkan di halaman utama.</p>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <SearchInput
                            value={params.search}
                            onChange={handleSearchChange}
                            onSubmit={() => router.get(route('admin.home.hero-sections'), params)}
                            placeholder="Cari Hero..."
                            className="w-full md:w-72"
                        />
                        {selectedIds.length > 0 && (
                            <ConfirmDeleteModal
                                selectedCount={selectedIds.length}
                                onConfirm={deleteSelected}
                            />
                        )}
                    </div>
                    <Button onClick={() => { reset(); setEditingHero(null); setIsModalOpen(true); }} className="gap-2">
                        <Plus size={18} /> Tambah Hero Section
                    </Button>
                </div>

                <Table>
                    <Thead>
                        <Tr>
                            <Th className="w-12 text-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedIds(heroSections.map(h => h.id));
                                        } else {
                                            setSelectedIds([]);
                                        }
                                    }}
                                    checked={heroSections.length > 0 && selectedIds.length === heroSections.length}
                                />
                            </Th>
                            <Th>Image</Th>
                            <Th>Title</Th>
                            <Th>Position</Th>
                            <Th>Status</Th>
                            <Th center>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {heroSections.map((hero) => (
                            <Tr key={hero.id}>
                                <Td className="text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300"
                                        checked={selectedIds.includes(hero.id)}
                                        onChange={() => {
                                            setSelectedIds((prev) =>
                                                prev.includes(hero.id)
                                                    ? prev.filter((id) => id !== hero.id)
                                                    : [...prev, hero.id]
                                            );
                                        }}
                                    />
                                </Td>
                                <Td>
                                    <img src={`/storage/${hero.image_path}`} className="w-20 h-12 object-cover rounded" />
                                </Td>
                                <Td className="font-medium">{hero.title}</Td>
                                <Td>{hero.position}</Td>
                                <Td>
                                    <Badge variant={hero.is_active ? 'default' : 'secondary'}>
                                        {hero.is_active ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </Td>
                                <Td center>
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(hero)}>
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingHero ? "Edit Hero" : "Tambah Hero"}
                footer={
                    <div className="flex justify-end gap-3 w-full">
                        <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing}
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                }
            >
                <HeroSectionForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                />
            </Modal>
        </AppLayout>
    );
}