import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { Label } from '@/components/ui/label';

interface LabLendingFormProps {
    data: {
        nama_peminjam: string;
        laboratorium_id: string;
        tanggal_pinjam: string;
        waktu_mulai?: string;
        waktu_selesai?: string;
        keperluan?: string;
    };
    setData: (key: string, value: any) => void;
    errors: any;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    laboratories: Array<{
        id: number;
        nama_lab: string;
    }>;
}

export const LabLendingForm = ({ 
    data, 
    setData, 
    errors, 
    processing, 
    onSubmit, 
    onCancel, 
    laboratories 
}: LabLendingFormProps) => (
    <form id="lab-lending" onSubmit={onSubmit} className="space-y-5 p-1">
        {/* Nama Peminjam */}
        <div className="space-y-1.5">
            <Label>Nama Peminjam</Label>
            <Input 
                value={data.nama_peminjam} 
                onChange={(e) => setData('nama_peminjam', e.target.value)} 
                placeholder="Masukkan nama lengkap..." 
                className="h-11 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 focus:ring-emerald-500"
            />
            {errors.nama_peminjam && <p className="text-red-500 text-[10px] font-medium mt-1 ml-1">{errors.nama_peminjam}</p>}
        </div>

        {/* Laboratorium */}
        <div className="space-y-1.5">
            <Label>Laboratorium </Label>
            <Select 
                value={data.laboratorium_id} 
                onValueChange={(v) => setData('laboratorium_id', v)}
            >
                <SelectTrigger className="h-11 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700">
                    <SelectValue placeholder="Pilih Laboratorium" />
                </SelectTrigger>
                <SelectContent className='z-[110] rounded-xl shadow-xl border-gray-100 dark:border-slate-800'>
                    {laboratories.map((l) => (
                        <SelectItem key={l.id} value={l.id.toString()} className="rounded-lg">
                            {l.nama_lab}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {errors.laboratorium_id && <p className="text-red-500 text-[10px] font-medium mt-1 ml-1">{errors.laboratorium_id}</p>}
        </div>

        {/* Tanggal & Waktu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <Label>Tanggal Pinjam</Label>
                <Input 
                    type="date" 
                    value={data.tanggal_pinjam} 
                    onChange={(e) => setData('tanggal_pinjam', e.target.value)} 
                    className="h-11 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 appearance-none"
                />
                {errors.tanggal_pinjam && <p className="text-red-500 text-[10px] font-medium mt-1 ml-1">{errors.tanggal_pinjam}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label>Mulai</Label>
                    <Input 
                        type="time" 
                        value={data.waktu_mulai} 
                        onChange={(e) => setData('waktu_mulai', e.target.value)} 
                        className="h-11 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>Selesai</Label>
                    <Input 
                        type="time" 
                        value={data.waktu_selesai} 
                        onChange={(e) => setData('waktu_selesai', e.target.value)} 
                        className="h-11 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700"
                    />
                </div>
            </div>
        </div>

        {/* Keperluan */}
        <div className="space-y-1.5">
            <Label>Keperluan</Label>
            <Input 
                value={data.keperluan} 
                onChange={(e) => setData('keperluan', e.target.value)} 
                placeholder="Contoh: Praktikum Basis Data Mandiri" 
                className="h-11 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700"
            />
            {errors.keperluan && <p className="text-red-500 text-[10px] font-medium mt-1 ml-1">{errors.keperluan}</p>}
        </div>

        {/* Footer Actions */}
        {/* <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 dark:border-slate-800">
            <Button 
                variant="ghost" 
                type="button" 
                onClick={onCancel}
                className="h-12 sm:h-10 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
            >
                Batal
            </Button>
            <Button 
                type="submit" 
                disabled={processing} 
                className="h-12 sm:h-10 px-8 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
                {processing ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Menyimpan...
                    </span>
                ) : 'Simpan Peminjaman'}
            </Button>
        </div> */}
    </form>
);