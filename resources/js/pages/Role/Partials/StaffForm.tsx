// resources/js/components/ui/StaffForm.tsx

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

interface StaffFormProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    isEditMode: boolean;
}

export const StaffForm = ({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    isEditMode
}: StaffFormProps) => {
    return (
        <form id="staff-form" onSubmit={onSubmit} className="space-y-4">
            {/* No. Induk / NIP */}
            <div className="space-y-2">
                <Label htmlFor="no_induk">No. Induk / NIP</Label>
                <Input
                    id="no_induk"
                    value={data.no_induk}
                    onChange={e => setData('no_induk', e.target.value)}
                    placeholder="Contoh: 19900101..."
                    className={errors.no_induk ? "border-red-500" : ""}
                />
                {errors.no_induk && (
                    <p className="text-red-500 text-xs mt-1">{errors.no_induk}</p>
                )}
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                    id="nama"
                    value={data.nama}
                    onChange={e => setData('nama', e.target.value)}
                    placeholder="Masukkan nama lengkap staff"
                    className={errors.nama ? "border-red-500" : ""}
                />
                {errors.nama && (
                    <p className="text-red-500 text-xs mt-1">{errors.nama}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Jabatan */}
                <div className="space-y-2">
                    <Label htmlFor="jabatan">Jabatan</Label>
                    <Select
                        value={data.jabatan}
                        onValueChange={(value) => setData('jabatan', value)}
                    >
                        <SelectTrigger id="jabatan" className={errors.jabatan ? "border-red-500" : ""}>
                            <SelectValue placeholder="Pilih Jabatan" />
                        </SelectTrigger>
                        <SelectContent className="z-[100]">
                            <SelectItem value="Kepala Lab">Kepala Lab</SelectItem>
                            <SelectItem value="Sekretaris">Sekretaris</SelectItem>
                            <SelectItem value="Teknisi">Teknisi</SelectItem>
                            <SelectItem value="Administrasi">Administrasi</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.jabatan && (
                        <p className="text-red-500 text-xs mt-1">{errors.jabatan}</p>
                    )}
                </div>

                {/* Bagian / Unit */}
                <div className="space-y-2">
                    <Label htmlFor="bagian">Bagian</Label>
                    <Input
                        id="bagian"
                        value={data.bagian}
                        onChange={e => setData('bagian', e.target.value)}
                        placeholder="Contoh: Lab Komputer"
                        className={errors.bagian ? "border-red-500" : ""}
                    />
                    {errors.bagian && (
                        <p className="text-red-500 text-xs mt-1">{errors.bagian}</p>
                    )}
                </div>
            </div>

            {/* No Telepon & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                    <Label htmlFor="email">Email Staff</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        placeholder="staff@siadlab.com"
                        className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                </div>
            </div>
        </form>
    );
};