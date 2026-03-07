// resources/js/components/ui/StudentForm.tsx

import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface StudentFormProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    isEditMode: boolean;
}

export const StudentForm = ({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    isEditMode
}: StudentFormProps) => {
    return (
        <form id="student-form" onSubmit={onSubmit} className="space-y-4">
            {/* NIM */}
            <div className="space-y-2">
                <Label htmlFor="nim">NIM</Label>
                <Input
                    id="nim"
                    value={data.nim}
                    onChange={e => setData('nim', e.target.value)}
                    placeholder="Contoh: 2021001"
                    className={errors.nim ? "border-red-500" : ""}
                />
                {errors.nim && (
                    <p className="text-red-500 text-xs mt-1">{errors.nim}</p>
                )}
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                    id="nama"
                    value={data.nama}
                    onChange={e => setData('nama', e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className={errors.nama ? "border-red-500" : ""}
                />
                {errors.nama && (
                    <p className="text-red-500 text-xs mt-1">{errors.nama}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Program Studi */}
                <div className="space-y-2">
                    <Label htmlFor="program_studi">Program Studi</Label>
                    <Select
                        value={data.program_studi}
                        onValueChange={(value) => setData('program_studi', value)}
                    >
                        <SelectTrigger id="program_studi">
                            <SelectValue placeholder="Pilih Prodi" />
                        </SelectTrigger>
                        <SelectContent className="z-[100]">
                            <SelectItem value="Informatika">Informatika</SelectItem>
                            <SelectItem value="Sistem Informasi">Sistem Informasi</SelectItem>
                            <SelectItem value="Ilmu Komputer">Ilmu Komputer</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.program_studi && (
                        <p className="text-red-500 text-xs mt-1">{errors.program_studi}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="kelas">Kelas</Label>
                    <Select
                        value={data.kelas}
                        onValueChange={(value) => setData('kelas', value)}
                    >
                        <SelectTrigger id="kelas" className={errors.kelas ? "border-red-500" : ""}>
                            <SelectValue placeholder="Pilih Kelas" />
                        </SelectTrigger>
                        <SelectContent className="z-[100]">
                            <SelectItem value="Pagi">Pagi</SelectItem>
                            <SelectItem value="Sore">Sore</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.kelas && (
                        <p className="text-red-500 text-xs mt-1">{errors.kelas}</p>
                    )}
                </div>
            </div>

            {/* Tahun Masuk & No Telepon */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="tahun_masuk">Tahun Masuk</Label>
                    <Input
                        id="tahun_masuk"
                        type="number"
                        value={data.tahun_masuk}
                        onChange={e => setData('tahun_masuk', e.target.value)}
                        placeholder="2024"
                        className={errors.tahun_masuk ? "border-red-500" : ""}
                    />
                    {errors.tahun_masuk && (
                        <p className="text-red-500 text-xs mt-1">{errors.tahun_masuk}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="no_telepon">No. Telepon</Label>
                    <Input
                        id="no_telepon"
                        value={data.no_telepon}
                        onChange={e => setData('no_telepon', e.target.value)}
                        placeholder="0812..."
                        className={errors.no_telepon ? "border-red-500" : ""}
                    />
                    {errors.no_telepon && (
                        <p className="text-red-500 text-xs mt-1">{errors.no_telepon}</p>
                    )}
                </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    placeholder="mahasiswa@siadlab.com"
                    className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
            </div>
        </form>
    );
};