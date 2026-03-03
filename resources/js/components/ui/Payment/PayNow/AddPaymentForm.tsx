import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input, Textarea } from "@/components/ui/input";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";

interface Spp {
    id: number;
    kategori_pembayaran: string;
    nominal: number;
}

interface Tagihan {
    id: number;
    jenis_tagihan?: string[];
    kategori?: string;
    nominal: number;
    tanggal_tagihan: string;
}

interface AddPaymentFormProps {
    listSpp: Spp[];
    tagihans?: Tagihan[];
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    onSubmit: (e: React.FormEvent) => void;
    onMethodChange?: (method: 'transfer' | 'cash') => void;
}

export const AddPaymentForm = ({ 
    data, 
    setData, 
    errors, 
    onSubmit, 
    listSpp = [],
    tagihans = [],
    onMethodChange
}: AddPaymentFormProps) => {
    const [activeJenis, setActiveJenis] = useState<Array<{label: string, nominal: number}>>([]);

    useEffect(() => {
        const jenisSet = new Set<string>();
        tagihans.forEach(t => {
            if (Array.isArray(t.jenis_tagihan)) {
                t.jenis_tagihan.forEach(jenis => jenisSet.add(jenis));
            }
        });

        const jenisList = Array.from(jenisSet)
            .sort()
            .map(jenis => {
                const sppItem = listSpp.find(spp => spp.kategori_pembayaran.toLowerCase() === jenis.toLowerCase());
                return {
                    label: jenis,
                    nominal: sppItem ? sppItem.nominal : 0
                };
            })
            .filter(item => item.nominal > 0);

        setActiveJenis(jenisList);
    }, [tagihans, listSpp]);

    return (
        <form id="add-payment-form" className="space-y-4" onSubmit={onSubmit}>
            <div>
                <Label htmlFor="kategori">Kategori Pembayaran</Label>
                <Select
                    value={data.kategori}
                    onValueChange={(value: string) => {
                        setData('kategori', value);
                        const found = activeJenis.find(j => j.label.toLowerCase() === value.toLowerCase());
                        if (found) setData('nominal', found.nominal);
                    }}
                >
                    <SelectTrigger id="kategori" className="w-full">
                        <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                        {activeJenis.length > 0 ? (
                            activeJenis.map((jenis) => (
                                <SelectItem key={jenis.label} value={jenis.label.toLowerCase()}>{jenis.label}</SelectItem>
                            ))
                        ) : (
                            <>
                                <SelectItem value="skripsi">Skripsi</SelectItem>
                                <SelectItem value="praktikum">Praktikum</SelectItem>
                                <SelectItem value="sempro">Sempro</SelectItem>
                                <SelectItem value="other">Lainnya</SelectItem>
                            </>
                        )}
                    </SelectContent>
                </Select>
                {errors.kategori && <p className="text-red-500 text-xs mt-1">{errors.kategori}</p>}
            </div>

            <div>
                <Label>Metode Pembayaran</Label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setData('jenis_pembayaran', 'transfer');
                            onMethodChange?.('transfer');
                        }}
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
                        onClick={() => {
                            setData('jenis_pembayaran', 'cash');
                            onMethodChange?.('cash');
                        }}
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

            <div>
                <Label htmlFor="nominal">Nominal (Rp)</Label>
                <Input
                    id="nominal"
                    type="number"
                    placeholder="Contoh: 500000"
                    value={data.nominal}
                    onChange={e => setData('nominal', e.target.value)}
                    required
                />
                {errors.nominal && <p className="text-red-500 text-xs mt-1">{errors.nominal}</p>}
            </div>

            <div>
                <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
                <Textarea
                    id="keterangan"
                    placeholder="Tambahkan catatan jika perlu..."
                    rows={2}
                    value={data.keterangan}
                    onChange={e => setData('keterangan', e.target.value)}
                />
            </div>
        </form>
    );
};