import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { EventItem } from '@/types';
import { Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EventForm } from "@/pages/Admin/Home/EventForm/EventForm";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { SearchInput } from '@/components/SearchInput';
import { ConfirmDeleteModal } from '@/components/ui/alert';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { NoSymbolIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface Props {
    events: EventItem[];
    filters?: { search?: string };
    auth: { user: { role: string } };
}

export default function EventsManagement({ events = [], filters = {}, auth }: Props) {
    useFlashMessages();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [params, setParams] = useState({ search: filters?.search || '' });

    const { data, setData, post, reset, processing, errors } = useForm({
        judul: '',
        deskripsi: '',
        tanggal: '',
        lokasi: '',
        poster: null as File | null,
        status: 'draft' as 'draft' | 'published',
    });

    const deleteSelected = () => {
        router.delete(route('events.bulk-delete'), {
            data: { ids: selectedIds },
            onSuccess: () => setSelectedIds([]),
        });
    };

    const handleEdit = (event: EventItem) => {
        setEditingEvent(event);
        setData({
            judul: event.judul,
            deskripsi: event.deskripsi,
            tanggal: event.tanggal.split('T')[0],
            lokasi: event.lokasi || '',
            poster: null,
            status: event.status as 'draft' | 'published',
        });
        setIsEditModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const routeName = editingEvent ? 'events.update' : 'events.store';
        const options = {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                reset();
            },
        };

        if (editingEvent) {
            post(route(routeName, editingEvent.id), options);
        } else {
            post(route(routeName), options);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setParams({ search: value });
        router.get(route('admin.home.events'), { search: value }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout>
            <Head title="Manajemen Event" />

            <div className="p-6">
                <header className="mb-6 flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Event</h1>
                        <p className="text-sm text-gray-500">Kelola daftar event yang ditampilkan di halaman utama.</p>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <SearchInput
                            value={params.search}
                            onChange={handleSearchChange}
                            onSubmit={() => router.get(route('events.index'), params)}
                            placeholder="Cari event..."
                            className="w-full md:w-72"
                        />
                        {selectedIds.length > 0 && (
                            <ConfirmDeleteModal
                                selectedCount={selectedIds.length}
                                onConfirm={deleteSelected}
                            />
                        )}
                    </div>
                    <Button onClick={() => { reset(); setEditingEvent(null); setIsCreateModalOpen(true); }} className="gap-2">
                        <Plus size={18} /> Tambah Event
                    </Button>
                </div>

                <Table>
                    <Thead>
                        <Tr>
                            <Th className="w-12 text-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300"
                                    onChange={(e) => setSelectedIds(e.target.checked ? events.map(e => e.id) : [])}
                                    checked={selectedIds.length === events.length && events.length > 0}
                                />
                            </Th>
                            <Th>Poster</Th>
                            <Th>Judul</Th>
                            <Th>Tanggal</Th>
                            <Th>Lokasi</Th>
                            <Th>Status</Th>
                            <Th center>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {events.map((event) => (
                            <Tr key={event.id}>
                                <Td className="text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300"
                                        checked={selectedIds.includes(event.id)}
                                        onChange={() => setSelectedIds(prev => prev.includes(event.id) ? prev.filter(i => i !== event.id) : [...prev, event.id])}
                                    />
                                </Td>
                                <Td>
                                    <img
                                        src={event.poster ? `/storage/${event.poster}` : '/images/Placeholder_Image.webp'}
                                        alt={event.judul}
                                        className="w-16 h-10 object-cover rounded"
                                    />
                                </Td>
                                <Td className="font-medium">{event.judul}</Td>
                                <Td>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar size={14} className="text-gray-400" />
                                        {new Date(event.tanggal).toLocaleDateString('id-ID')}
                                    </div>
                                </Td>
                                <Td className="text-sm">{event.lokasi || '-'}</Td>
                                <Td>
                                    <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                                        {event.status}
                                    </Badge>
                                </Td>
                                <Td center>
                                    <div className="flex justify-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </div>

            {/* Modal Gabungan (Create/Edit) */}
            <Modal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); reset(); }}
                title={isEditModalOpen ? "Edit Event" : "Tambah Event Baru"}
                maxWidth="lg"
                footer={
                    <>
                        <Button variant="outline" className="flex-1" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); reset(); }} disabled={processing}>
                            Batal
                        </Button>
                        <Button onClick={handleSubmit} className="flex-1" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </>
                }
            >
                <EventForm
                    isEdit={!!editingEvent}
                    currentPoster={editingEvent?.poster}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                />
            </Modal>
        </AppLayout>
    );
}