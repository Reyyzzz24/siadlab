import React from 'react';
import { Label } from "@/components/ui/label";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react"; // Import icon untuk estetika

interface EventFormProps {
    data: any;
    setData: any;
    errors: any;
    processing: boolean;
    isEdit?: boolean;
    currentPoster?: string | null;
    onSubmit?: (e: React.FormEvent) => void; // Tambahkan ? agar opsional
    onCancel?: () => void;                   // Tambahkan ? agar opsional
}
export const EventForm = ({ 
    data, setData, errors, processing, onSubmit, onCancel, isEdit, currentPoster 
}: EventFormProps) => (
    <form onSubmit={onSubmit} className="space-y-4">
        <div>
            <Label htmlFor="judul">Judul Event</Label>
            <Input 
                id="judul"
                value={data.judul} 
                onChange={e => setData('judul', e.target.value)} 
                placeholder="Masukkan judul event"
            />
            {errors.judul && <p className="text-red-500 text-xs mt-1">{errors.judul}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="tanggal">Tanggal Pelaksanaan</Label>
                <Input 
                    id="tanggal"
                    type="date" 
                    value={data.tanggal} 
                    onChange={e => setData('tanggal', e.target.value)} 
                />
                {errors.tanggal && <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>}
            </div>

            {/* INPUT LOKASI BARU */}
            <div>
                <Label htmlFor="lokasi">Lokasi Event</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        id="lokasi"
                        className="pl-9"
                        value={data.lokasi} 
                        onChange={e => setData('lokasi', e.target.value)} 
                        placeholder="Gedung/Ruangan/Online"
                    />
                </div>
                {errors.lokasi && <p className="text-red-500 text-xs mt-1">{errors.lokasi}</p>}
            </div>
        </div>

        <div>
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea 
                id="deskripsi"
                value={data.deskripsi} 
                onChange={e => setData('deskripsi', e.target.value)} 
                rows={4}
                placeholder="Jelaskan detail event..."
            />
            {errors.deskripsi && <p className="text-red-500 text-xs mt-1">{errors.deskripsi}</p>}
        </div>

        <div>
            <Label>Poster Event</Label>
            {isEdit && currentPoster && (
                <div className="relative w-32 h-20 mb-3 rounded-lg overflow-hidden border dark:border-gray-700">
                    <img src={`/storage/${currentPoster}`} className="object-cover w-full h-full" alt="Current poster" />
                </div>
            )}
            <Input 
                type="file" 
                onChange={e => setData('poster', e.target.files ? e.target.files[0] : null)} 
                accept="image/*"
                className="cursor-pointer"
            />
            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Format: JPG, PNG (Max 2MB)</p>
            {errors.poster && <p className="text-red-500 text-xs mt-1">{errors.poster}</p>}
        </div>

        <div>
            <Label htmlFor="status">Status Publikasi</Label>
            <Select
                value={data.status}
                onValueChange={(value) => setData('status', value)}
            >
                <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Publish</SelectItem>
                </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
        </div>

        {/* <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Batal
            </Button>
            <Button 
                type="submit" 
                disabled={processing} 
                className="flex-1"
            >
                {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Event'}
            </Button>
        </div> */}
    </form>
);