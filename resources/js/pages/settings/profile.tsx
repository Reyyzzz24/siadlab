import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useState, useRef } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const role = user?.role || 'user';

    const fileInput = useRef<HTMLInputElement>(null);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <Form
                        {...ProfileController.updateFromModal.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        encType="multipart/form-data"
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors, isDirty }) => (
                            <>
                                {/* PHOTO */}
                                <div className="flex flex-col items-center gap-2 pb-4">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-500">
                                        <img
                                            src={
                                                user?.profile_photo_path
                                                    ? `/storage/${user.profile_photo_path}`
                                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=22d3ee&color=fff`
                                            }
                                            className="w-full h-full object-cover"
                                            alt="Preview"
                                        />
                                    </div>

                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={fileInput}
                                        name="photo"
                                        onChange={(e) => setSelectedFileName(e.target.files && e.target.files[0] ? e.target.files[0].name : null)}
                                        accept="image/*"
                                    />

                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => fileInput.current?.click()} className="btn btn-outline btn-sm">
                                            Ganti Foto
                                        </button>
                                        {selectedFileName && <span className="text-xs text-cyan-600 font-medium">{selectedFileName}</span>}
                                    </div>
                                    {errors.photo && <span className="text-xs text-red-500">{errors.photo}</span>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={user?.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Nama lengkap"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={user?.email}
                                        name="email"
                                        required
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {/* Mahasiswa fields */}
                                {role === 'mahasiswa' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="nim">NIM</Label>
                                            <Input id="nim" name="nim" defaultValue={user?.mahasiswa?.nim || ''} />
                                            <InputError message={errors.nim} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="program_studi">Prodi</Label>
                                            <Input id="program_studi" name="program_studi" defaultValue={user?.mahasiswa?.program_studi || ''} />
                                            <InputError message={errors.program_studi} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="kelas">Kelas</Label>

                                            {/* Input hidden ini wajib ada agar data 'kelas' terkirim saat submit form */}
                                            <input type="hidden" name="kelas" defaultValue={user?.mahasiswa?.kelas || ''} id="kelas-hidden" />

                                            <Select
                                                defaultValue={user?.mahasiswa?.kelas || ''}
                                                onValueChange={(value) => {
                                                    // Kita update nilai input hidden setiap kali dropdown berubah
                                                    const hiddenInput = document.getElementById('kelas-hidden') as HTMLInputElement;
                                                    if (hiddenInput) hiddenInput.value = value;
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih Kelas" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[100]">
                                                    <SelectItem value="Pagi">Pagi</SelectItem>
                                                    <SelectItem value="Sore">Sore</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <InputError message={errors.kelas} />
                                        </div>
                                    </div>
                                )}

                                {/* Petugas / Admin fields */}
                                {(role === 'petugas' || role === 'admin') && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="no_induk">No. Induk</Label>
                                            <Input id="no_induk" name="no_induk" defaultValue={user?.petugas?.no_induk || user?.administrator?.no_induk || ''} />
                                            <InputError message={errors.no_induk} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="jabatan">Jabatan</Label>
                                                <Input id="jabatan" name="jabatan" defaultValue={user?.petugas?.jabatan || user?.administrator?.jabatan || ''} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="bagian">Bagian</Label>
                                                <Input id="bagian" name="bagian" defaultValue={user?.petugas?.bagian || user?.administrator?.bagian || ''} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="no_telepon">No. Telepon</Label>
                                    <Input id="no_telepon" name="no_telepon" defaultValue={user?.mahasiswa?.no_telepon || user?.petugas?.no_telepon || user?.administrator?.no_telepon || ''} />
                                    <InputError message={errors.no_telepon} />
                                </div>

                                {mustVerifyEmail && user?.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to resend the verification email.
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">A new verification link has been sent to your email address.</div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing || !isDirty} // Tambahkan !isDirty
                                        data-test="update-profile-button"
                                    >
                                        Simpan Perubahan
                                    </Button>

                                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                        <p className="text-sm text-neutral-600">Saved</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
