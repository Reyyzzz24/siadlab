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
import { 
    UserIcon, 
    BoxIcon, 
    HashIcon, 
    CalendarIcon, 
    ArrowRightIcon 
} from "lucide-react";

interface AddLendingFormProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isEditMode: boolean;
    barangTersedia: Array<{ namabarang: string; idbarang: string; stok?: number }>;
}

export const AddLendingForm = ({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    isEditMode,
    barangTersedia,
}: AddLendingFormProps) => {

    return (
        // id="item-lending" digunakan untuk tombol submit di luar form (footer modal)
        <form id="item-lending" onSubmit={onSubmit} className="space-y-5">
            {/* Nama Peminjam */}
            <div className="space-y-1.5">
                <Label>Nama Peminjam</Label>
                <Input
                    id="nama_peminjam"
                    value={data.nama_peminjam || ''}
                    onChange={e => setData('nama_peminjam', e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className={`h-12 rounded-xl bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 ${errors.nama_peminjam ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.nama_peminjam && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.nama_peminjam}</p>}
            </div>

            {/* Pilih Barang */}
            <div className="space-y-1.5">
                <Label>Pilih Barang</Label>
                <Select
                    onValueChange={(value) => setData('barang_id', value)}
                    defaultValue={data.barang_id}
                >
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700">
                        <SelectValue placeholder="Cari Barang..." />
                    </SelectTrigger>
                    <SelectContent className="z-[100] rounded-xl shadow-2xl">
                        {barangTersedia.map((barang) => (
                            <SelectItem key={barang.idbarang} value={barang.idbarang.toString()} className="h-11">
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{barang.namabarang}</span>
                                    {barang.stok !== undefined && <span className="text-[10px] opacity-50">Stok: {barang.stok}</span>}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.barang_id && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.barang_id}</p>}
            </div>

            {/* Grid untuk Jumlah dan Tanggal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Jumlah</Label>
                    <Input
                        id="jumlah"
                        type="number"
                        min={1}
                        value={data.jumlah ?? ""}
                        onChange={e => {
                            const val = e.target.value;
                            setData('jumlah', val === "" ? "" : Number(val));
                        }}
                        className={`h-12 rounded-xl bg-gray-50 dark:bg-slate-800/50 ${errors.jumlah ? "border-red-500" : "border-gray-100"}`}
                    />
                    {errors.jumlah && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.jumlah}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label>Tanggal Pinjam</Label>
                    <Input
                        id="tanggal_pinjam"
                        type="date"
                        value={data.tanggal_pinjam || ''}
                        onChange={e => setData('tanggal_pinjam', e.target.value)}
                        className="h-12 rounded-xl bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 appearance-none"
                    />
                    {errors.tanggal_pinjam && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.tanggal_pinjam}</p>}
                </div>
            </div>

            {/* Tanggal Kembali */}
            <div className="space-y-1.5">
                <Label>Tanggal Kembali</Label>
                <Input
                    id="tanggal_kembali"
                    type="date"
                    value={data.tanggal_kembali || ''}
                    onChange={e => setData('tanggal_kembali', e.target.value)}
                    className="h-12 rounded-xl bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 appearance-none"
                />
                {errors.tanggal_kembali && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.tanggal_kembali}</p>}
            </div>
        </form>
    );
};