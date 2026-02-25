import React from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { CalendarIcon, GraduationCapIcon, CreditCardIcon, CheckCircle2Icon } from "lucide-react"

interface MassSppFormProps {
    data: any
    setData: any
    errors: any
    processing: boolean
    onSubmit: (e: React.FormEvent) => void
    onCancel: () => void
    isEdit?: boolean
    tahunMasukList: string[]
    kategoriSpp: Array<{ id: number; kategori_pembayaran: string; nominal: number }>
    handleCheckboxChange: (kategori: string) => void
    formatRupiah: (val: number) => string
}

export const MassSppForm = ({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    onCancel,
    isEdit,
    tahunMasukList,
    kategoriSpp,
    handleCheckboxChange,
    formatRupiah
}: MassSppFormProps) => {
    return (
        <form id="mass-spp-form" onSubmit={onSubmit} className="space-y-5">
            {/* Angkatan */}
            {!isEdit && (
                <div className="space-y-1.5">
                    <Label>Angkatan</Label>
                    <Select
                        value={data.tahun_masuk || ''}
                        onValueChange={(val) => setData('tahun_masuk', val)}
                    >
                        <SelectTrigger id="angkatan" className="h-12 rounded-xl bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700">
                            <SelectValue placeholder="Semua Angkatan" />
                        </SelectTrigger>
                        <SelectContent className="z-[100] rounded-xl shadow-2xl">
                            <SelectItem value="all">Semua Angkatan</SelectItem>
                            {tahunMasukList.map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.tahun_masuk && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.tahun_masuk}</p>}
                </div>
            )}

            {/* Jenis Tagihan - Optimized for Mobile Scrolling */}
            <div className="space-y-1.5">
                <Label>Pilih Jenis Tagihan</Label>
                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto p-2 rounded-xl bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 scrollbar-thin">
                    {kategoriSpp.map((spp) => {
                        const isChecked = data.jenis_tagihan.includes(spp.kategori_pembayaran);
                        return (
                            <label 
                                key={spp.id} 
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                                    isChecked 
                                    ? 'bg-blue-50/80 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                                    : 'bg-white dark:bg-slate-800 border-transparent hover:border-gray-200 dark:hover:border-slate-700'
                                }`}
                            >
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-md border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 bg-transparent"
                                        checked={isChecked}
                                        onChange={() => handleCheckboxChange(spp.kategori_pembayaran)}
                                    />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                        {spp.kategori_pembayaran}
                                    </span>
                                    <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                                        {formatRupiah(spp.nominal)}
                                    </span>
                                </div>
                                {isChecked && <CheckCircle2Icon className="w-4 h-4 text-blue-500" />}
                            </label>
                        );
                    })}
                </div>
                {errors.jenis_tagihan && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.jenis_tagihan}</p>}
            </div>

            {/* Nominal & Jatuh Tempo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Total Nominal</Label>
                    <div className="relative">
                        <Input
                            readOnly
                            value={formatRupiah(data.nominal)}
                            className="h-12 rounded-xl bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 font-bold text-blue-700 dark:text-blue-400 pointer-events-none"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label>Jatuh Tempo</Label>
                    <Input
                        id="jatuh_tempo"
                        type="date"
                        value={data.tanggal_jatuh_tempo}
                        onChange={(e) => setData('tanggal_jatuh_tempo', e.target.value)}
                        className="h-12 rounded-xl bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700"
                    />
                </div>
            </div>

            {/* Status (Hanya Muncul saat Edit) */}
            {isEdit && (
                <div className="space-y-1.5">
                    <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Status Pembayaran</Label>
                    <Select
                        value={data.status || ''}
                        onValueChange={(val) => setData('status', val)}
                    >
                        <SelectTrigger id="status" className="h-12 rounded-xl bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700">
                            <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent className="z-[100] rounded-xl">
                            <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                            <SelectItem value="lunas">Lunas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Action Buttons (Mobile First) */}
            {/* <div className="pt-6 flex flex-col-reverse sm:flex-row gap-3 border-t border-gray-100 dark:border-slate-800">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="h-12 sm:h-10 rounded-xl font-bold text-gray-500 order-2 sm:order-1 sm:flex-1"
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="h-12 sm:h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 order-1 sm:order-2 sm:flex-1 active:scale-95 transition-all"
                >
                    {processing ? 'Memproses...' : (isEdit ? 'Update Tagihan' : 'Generate Tagihan')}
                </Button>
            </div> */}
        </form>
    )
}