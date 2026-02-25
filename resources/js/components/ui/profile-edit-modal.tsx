import { useForm, usePage, router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRef, useState, useEffect } from 'react';

export function ProfileEditModal() {
    const [isOpen, setIsOpen] = useState(false);
    const { auth }: any = usePage().props;
    const user = auth?.user;
    const role = user?.role || 'user';

    // 2. Inisialisasi useForm
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH',
        name: user?.name || '',
        email: user?.email || '',
        nim: user?.mahasiswa?.nim || '',
        no_induk: user?.petugas?.no_induk || user?.administrator?.no_induk || '',
        program_studi: user?.mahasiswa?.program_studi || '',
        kelas: user?.mahasiswa?.kelas || '',
        tahun_masuk: user?.mahasiswa?.tahun_masuk || '',
        jabatan: user?.petugas?.jabatan || user?.administrator?.jabatan || '',
        bagian: user?.petugas?.bagian || user?.administrator?.bagian || '',
        no_telepon: user?.mahasiswa?.no_telepon || user?.petugas?.no_telepon || user?.administrator?.no_telepon || '',
        photo: null as File | null,
    });

    const fileInput = useRef<HTMLInputElement>(null);

    // 3. Sinkronisasi data saat modal dibuka (Gunakan setData objek)
    useEffect(() => {
        if (isOpen && user) {
            setData((prevData: any) => ({
                ...prevData,
                name: user.name || '',
                email: user.email || '',
                nim: user.mahasiswa?.nim || '',
                no_induk: user.petugas?.no_induk || user.administrator?.no_induk || '',
                program_studi: user.mahasiswa?.program_studi || '',
                kelas: user.mahasiswa?.kelas || '',
                tahun_masuk: user.mahasiswa?.tahun_masuk || '',
                jabatan: user.petugas?.jabatan || user.administrator?.jabatan || '',
                bagian: user.petugas?.bagian || user.administrator?.bagian || '',
                no_telepon: user.mahasiswa?.no_telepon || user.petugas?.no_telepon || user.administrator?.no_telepon || '',
                photo: null, 
            }));
        }
    }, [isOpen, user]);

    // 4. Listener untuk membuka modal dari luar (Navbar)
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('show-profile-modal', handleOpen);
        return () => window.removeEventListener('show-profile-modal', handleOpen);
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.modal.update'), {
            forceFormData: true,
            onSuccess: () => {
                setIsOpen(false);
                // router.visit('/') akan merefresh data props
                router.visit('/', { preserveScroll: true });
            },
        });
    };

    // 5. Pengecekan kondisi diletakkan DI SINI (Sebelum JSX, tapi setelah semua Hook)
    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Profile ({role.toUpperCase()})</DialogTitle>
                    <DialogDescription className="sr-only">
                        Perbarui informasi profil Anda di sini. Klik simpan setelah selesai.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    {/* FOTO PROFILE */}
                    <div className="flex flex-col items-center gap-2 pb-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-500">
                            <img
                                src={user.profile_photo_path
                                    ? `/storage/${user.profile_photo_path}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=22d3ee&color=fff`}
                                className="w-full h-full object-cover"
                                alt="Preview"
                            />
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInput}
                            onChange={(e) => setData('photo', e.target.files ? e.target.files[0] : null)}
                            accept="image/*"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
                            Ganti Foto
                        </Button>
                        {data.photo && <span className="text-xs text-cyan-600 font-medium">{data.photo.name}</span>}
                        {errors.photo && <span className="text-xs text-red-500">{errors.photo}</span>}
                    </div>

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} />
                            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                        </div>

                        {/* MAHASISWA */}
                        {role === 'mahasiswa' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="nim">NIM</Label>
                                    <Input id="nim" value={data.nim} onChange={e => setData('nim', e.target.value)} />
                                    {errors.nim && <span className="text-xs text-red-500">{errors.nim}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prodi">Prodi</Label>
                                    <Input id="prodi" value={data.program_studi} onChange={e => setData('program_studi', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kelas">Kelas</Label>
                                    <Input id="kelas" value={data.kelas} onChange={e => setData('kelas', e.target.value)} />
                                </div>
                            </div>
                        )}

                        {/* PETUGAS / ADMIN */}
                        {(role === 'petugas' || role === 'admin') && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="no_induk">No. Induk</Label>
                                    <Input id="no_induk" value={data.no_induk} onChange={e => setData('no_induk', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="jabatan">Jabatan</Label>
                                        <Input id="jabatan" value={data.jabatan} onChange={e => setData('jabatan', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bagian">Bagian</Label>
                                        <Input id="bagian" value={data.bagian} onChange={e => setData('bagian', e.target.value)} />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="telp">No. Telepon</Label>
                            <Input id="telp" value={data.no_telepon} onChange={e => setData('no_telepon', e.target.value)} />
                            {errors.no_telepon && <span className="text-xs text-red-500">{errors.no_telepon}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Email (Tetap)</Label>
                            <Input value={data.email} disabled className="bg-gray-50 dark:bg-slate-800" />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Batal</Button>
                        <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}