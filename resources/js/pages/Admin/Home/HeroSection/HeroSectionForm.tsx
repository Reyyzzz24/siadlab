import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface HeroSectionFormProps {
    data: any;
    setData: any;
    errors: any;
    processing: boolean;
    onSubmit?: (e: React.FormEvent) => void;
}

export const HeroSectionForm = ({
    data, setData, errors, processing, onSubmit,
}: HeroSectionFormProps) => (
    <form onSubmit={onSubmit} className="space-y-4">
        {/* Title & Subtitle */}
        <div>
            <Label htmlFor="title">Judul (Title)</Label>
            <Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Masukkan judul utama" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
            <Label htmlFor="subtitle">Sub-judul (Subtitle)</Label>
            <Textarea id="subtitle" value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} placeholder="Masukkan sub-judul" />
            {errors.subtitle && <p className="text-red-500 text-xs mt-1">{errors.subtitle}</p>}
        </div>

        {/* CTA Section */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="cta_text">Teks Tombol (CTA)</Label>
                <Input id="cta_text" value={data.cta_text} onChange={e => setData('cta_text', e.target.value)} placeholder="Contoh: Daftar Sekarang" />
            </div>
            <div>
                <Label htmlFor="cta_link">Link Tombol (CTA)</Label>
                <Input id="cta_link" value={data.cta_link} onChange={e => setData('cta_link', e.target.value)} placeholder="/url-tujuan" />
            </div>
        </div>

        {/* Position & Status */}
        <div className="grid grid-cols-2 gap-4 items-center">
            <div>
                <Label htmlFor="position">Posisi Urutan</Label>
                <Input id="position" type="number" value={data.position} onChange={e => setData('position', parseInt(e.target.value))} />
                {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
            </div>
            <div className="flex items-center space-x-2 pt-6">
                <Switch id="is_active" checked={data.is_active} onCheckedChange={(val) => setData('is_active', val)} />
                <Label htmlFor="is_active">Aktifkan Slide</Label>
            </div>
        </div>

        {/* Image Upload */}
        <div>
            <Label>Gambar Banner</Label>
            <Input type="file" onChange={e => setData('image_path', e.target.files ? e.target.files[0] : null)} accept="image/*" />
            <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, WEBP (Max 2MB)</p>
            {errors.image_path && <p className="text-red-500 text-xs mt-1">{errors.image_path}</p>}
        </div>
    </form>
);