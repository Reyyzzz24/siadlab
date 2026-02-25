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

interface MasterSppFormProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isEditMode: boolean;
}

export const MasterSppForm = ({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    onCancel,
    isEditMode
}: MasterSppFormProps) => {
    return (
        <form id='tuition-form' onSubmit={onSubmit} className="space-y-4">
            {/* Kategori Pembayaran */}
            <div className="space-y-2">
                <Label htmlFor="kategori">Kategori Pembayaran</Label>
                <Input
                    id="kategori"
                    value={data.kategori_pembayaran}
                    onChange={e => setData('kategori_pembayaran', e.target.value)}
                    placeholder="Contoh: Praktikum"
                    className={errors.kategori_pembayaran ? "border-red-500" : ""}
                />
                {errors.kategori_pembayaran && (
                    <p className="text-red-500 text-xs mt-1">{errors.kategori_pembayaran}</p>
                )}
            </div>

            {/* Nominal */}
            <div className="space-y-2">
                <Label htmlFor="nominal">Nominal</Label>
                <Input
                    id="nominal"
                    type="number"
                    value={data.nominal}
                    onChange={e => {
                        const val = e.target.value;
                        setData('nominal', val === "" ? "" : Number(val));
                    }}
                    placeholder="0"
                    className={errors.nominal ? "border-red-500" : ""}
                />
                {errors.nominal && (
                    <p className="text-red-500 text-xs mt-1">{errors.nominal}</p>
                )}
            </div>

            {/* Status menggunakan Select Component */}
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
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                    </SelectContent>
                </Select>
                {errors.status && (
                    <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                )}
            </div>

            {/* Action Buttons */}
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
                    {processing ? 'Menyimpan...' : (isEditMode ? 'Update SPP' : 'Simpan SPP')}
                </Button>
            </div> */}
        </form>
    );
};