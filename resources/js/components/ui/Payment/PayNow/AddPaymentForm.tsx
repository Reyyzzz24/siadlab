import React from 'react';
import { Label } from "@/components/ui/label";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";

interface AddPaymentFormProps {
    id?: string; // Tambahkan ini agar TypeScript tidak komplain
    data: any;
    setData: any;
    errors: any;
    processing: boolean;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const AddPaymentForm = ({ 
    data, 
    setData, 
    errors, 
    processing, 
    onSubmit, 
    onCancel 
}: AddPaymentFormProps) => {
    return (
        <form id="add-payment-form" className="space-y-4" onSubmit={onSubmit}>
            {/* Kategori Pembayaran */}
            <div>
                <Label htmlFor="kategori">Kategori Pembayaran</Label>
                <Select
                    value={data.kategori}
                    onValueChange={(value: string) => setData('kategori', value)}
                >
                    <SelectTrigger id="kategori" className="w-full">
                        <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                        <SelectItem value="skripsi">Skripsi</SelectItem>
                        <SelectItem value="praktikum">Praktikum</SelectItem>
                        <SelectItem value="sempro">Sempro</SelectItem>
                        <SelectItem value="semhas">Semhas</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                </Select>
                {errors.kategori && <p className="text-red-500 text-xs mt-1">{errors.kategori}</p>}
            </div>

            {/* Metode Pembayaran */}
            <div>
                <Label>Metode Pembayaran</Label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setData('jenis_pembayaran', 'transfer')}
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                            data.jenis_pembayaran === 'transfer'
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50'
                        }`}
                    >
                        Transfer Bank
                    </button>
                    <button
                        type="button"
                        onClick={() => setData('jenis_pembayaran', 'cash')}
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                            data.jenis_pembayaran === 'cash'
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                : 'border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50'
                        }`}
                    >
                        Cash (Tunai)
                    </button>
                </div>
            </div>

            {/* Nominal */}
            <div>
                <Label htmlFor="nominal">Nominal (Rp)</Label>
                <Input
                    id="nominal"
                    type="number"
                    placeholder="Contoh: 500000"
                    value={data.nominal}
                    onChange={e => setData('nominal', e.target.value)}
                    required
                    className="w-full"
                />
                {errors.nominal && <p className="text-red-500 text-xs mt-1">{errors.nominal}</p>}
            </div>

            {/* Keterangan */}
            <div>
                <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
                <Textarea
                    id="keterangan"
                    placeholder="Tambahkan catatan jika perlu..."
                    rows={2}
                    value={data.keterangan}
                    onChange={e => setData('keterangan', e.target.value)}
                    className="w-full"
                />
            </div>

            {/* Actions */}
            {/* <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {processing ? 'Menyimpan...' : 'Simpan Tagihan'}
                </Button>
            </div> */}
        </form>
    );
};