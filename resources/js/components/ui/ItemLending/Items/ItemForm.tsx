// resources/js/components/ui/ItemForm.tsx

import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ItemFormProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isEditMode: boolean;
}

export const ItemForm = ({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    onCancel,
    isEditMode
}: ItemFormProps) => {
    return (
        /* Menggunakan space-y-4 untuk konsistensi margin antar field */
        <form id="item-form" onSubmit={onSubmit} className="space-y-4">
            {/* Nama Barang */}
            <div className="space-y-2">
                <Label htmlFor="namabarang">Nama Barang</Label>
                <Input
                    id="namabarang"
                    value={data.namabarang}
                    onChange={e => setData('namabarang', e.target.value)}
                    placeholder="Masukkan nama barang"
                    className={errors.namabarang ? "border-red-500" : ""}
                />
                {errors.namabarang && (
                    <p className="text-red-500 text-xs mt-1">{errors.namabarang}</p>
                )}
            </div>

            {/* Kategori menggunakan komponen Select UI agar seragam */}
            <div className="space-y-2">
                <Label htmlFor="kategori">Kategori</Label>
                <Select
                    value={data.kategori}
                    onValueChange={(value) => setData('kategori', value)}
                >
                    <SelectTrigger id="kategori" className="w-full">
                        <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                        <SelectItem value="Elektronik">Elektronik</SelectItem>
                        <SelectItem value="Kendaraan">Kendaraan</SelectItem>
                        <SelectItem value="Peralatan">Peralatan</SelectItem>
                        <SelectItem value="Furnitur">Furnitur</SelectItem>
                    </SelectContent>
                </Select>
                {errors.kategori && (
                    <p className="text-red-500 text-xs mt-1">{errors.kategori}</p>
                )}
            </div>

            {/* Tanggal Masuk */}
            <div className="space-y-2">
                <Label htmlFor="tanggal_masuk">Tanggal Masuk</Label>
                <Input
                    id="tanggal_masuk"
                    type="date"
                    value={data.tanggal_masuk}
                    onChange={e => setData('tanggal_masuk', e.target.value)}
                    className={errors.tanggal_masuk ? "border-red-500" : ""}
                />
                {errors.tanggal_masuk && (
                    <p className="text-red-500 text-xs mt-1">{errors.tanggal_masuk}</p>
                )}
            </div>

            {/* Status menggunakan komponen Select UI */}
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                    value={data.status}
                    onValueChange={(value) => setData('status', value)}
                >
                    <SelectTrigger id="status" className="w-full">
                        <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                        <SelectItem value="dipinjam">Dipinjam</SelectItem>
                        <SelectItem value="rusak">Rusak</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                    </SelectContent>
                </Select>
                {errors.status && (
                    <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                )}
            </div>

            {/* Stok Barang */}
            <div className="space-y-2">
                <Label htmlFor="stok">Jumlah Stok</Label>
                <Input
                    id="stok"
                    type="number"
                    min="0"
                    value={data.stok ?? ""}
                    onChange={e => {
                        const val = e.target.value;
                        setData('stok', val === "" ? "" : Number(val));
                    }}
                    placeholder="0"
                    className={errors.stok ? "border-red-500" : ""}
                />
                {errors.stok && (
                    <p className="text-red-500 text-xs mt-1">{errors.stok}</p>
                )}
            </div>

            {/* Harga Barang */}
            <div className="space-y-2">
                <Label htmlFor="hargabarang">Harga Barang (Rp)</Label>
                <Input
                    id="hargabarang"
                    type="number"
                    value={data.hargabarang ?? ""}
                    onChange={e => {
                        const val = e.target.value;
                        setData('hargabarang', val === "" ? "" : Number(val));
                    }}
                    placeholder="0" 
                    className={errors.hargabarang ? "border-red-500" : ""}
                />
                {errors.hargabarang && (
                    <p className="text-red-500 text-xs mt-1">{errors.hargabarang}</p>
                )}
            </div>

            {/* Action Buttons: Mengikuti layout MasterSppForm (pt-4, flex-1, bg-blue-600) */}
            {/* <div className="pt-4 flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onCancel}
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={processing}
                >
                    {processing ? 'Menyimpan...' : (isEditMode ? 'Update Barang' : 'Simpan Barang')}
                </Button>
            </div> */}
        </form>
    );
};