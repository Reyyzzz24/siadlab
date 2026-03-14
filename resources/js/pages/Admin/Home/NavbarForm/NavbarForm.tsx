import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"; // Menggunakan switch untuk is_active

interface NavbarFormProps {
    data: any;
    setData: any;
    errors: any;
    processing: boolean;
    isEdit?: boolean;
    allMenus: any[];
    currentPoster?: string | null;
    onSubmit?: (e: React.FormEvent) => void;
}

export const NavbarForm = ({
    data, setData, errors, processing, isEdit, allMenus, onSubmit, 
}: NavbarFormProps) => (
    <form onSubmit={onSubmit} className="space-y-4">
        {/* Title & URL */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Nama navbar" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
                <Label htmlFor="url">URL</Label>
                <Input id="url" value={data.url} onChange={e => setData('url', e.target.value)} placeholder="/contoh-link" />
                {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
            </div>
        </div>

        {/* Parent & Priority */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="parent_id">Parent Menu</Label>
                <Select value={data.parent_id?.toString() || ''} onValueChange={(val) => setData('parent_id', val === '0' ? null : val)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Parent (Opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">None (Root)</SelectItem>
                        {allMenus.map(menu => (
                            <SelectItem key={menu.id} value={menu.id.toString()}>{menu.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="order_priority">Order Priority</Label>
                <Input id="order_priority" type="number" value={data.order_priority} onChange={e => setData('order_priority', e.target.value)} />
            </div>
        </div>

        {/* Target & Active */}
        <div className="grid grid-cols-2 gap-4 items-center">
            <div>
                <Label htmlFor="target">Target</Label>
                <Select value={data.target} onValueChange={(val) => setData('target', val)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_self">_self (Tab saat ini)</SelectItem>
                        <SelectItem value="_blank">_blank (Tab baru)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
                <Switch id="is_active" checked={data.is_active} onCheckedChange={(val) => setData('is_active', val)} />
                <Label htmlFor="is_active">Is Active</Label>
            </div>
        </div>

        {/* Icon */}
        <div>
            <Label>Ikon (Opsional)</Label>
            <Input type="file" onChange={e => setData('icon', e.target.files ? e.target.files[0] : null)} accept="image/*" />
        </div>
    </form>
);