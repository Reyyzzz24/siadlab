    import React from 'react';
    import { Input } from '@/components/ui/input';
    import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';

    interface Props {
        data: any;
        setData: (key: string, value: any) => void;
        errors: any;
        processing: boolean;
        isEditMode: boolean;
        onSubmit: (e: React.FormEvent) => void;
        onCancel: () => void;
    }

    export const LabForm = ({ data, setData, errors, processing, isEditMode, onSubmit, onCancel }: Props) => {
        return (
            <form id="lab-form" onSubmit={onSubmit} className="space-y-5 p-1">
                {/* Input Nama Lab */}
                <div className="space-y-2">
                    <Label htmlFor="nama_lab">Nama Laboratorium</Label>
                    <Input 
                        id="nama_lab"
                        value={data.nama_lab || ''} 
                        onChange={(e) => setData('nama_lab', e.target.value)} 
                        className={errors.nama_lab ? "border-red-500" : ""}
                    />
                    {errors.nama_lab && <p className="text-red-500 text-xs mt-1">{errors.nama_lab}</p>}
                </div>

                {/* Input Lokasi */}
                <div className="space-y-2">
                    <Label htmlFor="lokasi">Lokasi / Gedung</Label>
                    <Input 
                        id="lokasi"
                        value={data.lokasi || ''} 
                        onChange={(e) => setData('lokasi', e.target.value)} 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Kapasitas */}
                    <div className="space-y-2">
                        <Label htmlFor="kapasitas">Kapasitas</Label>
                        <Input 
                            id="kapasitas"
                            type="number" 
                            value={data.kapasitas ?? ''} 
                            onChange={(e) => setData('kapasitas', e.target.value ? Number(e.target.value) : '')} 
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={data.status || 'available'} onValueChange={(val) => setData('status', val)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent className='z-[110]'>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="unavailable">Unavailable</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                {/* TOMBOL DIHAPUS DARI SINI */}
            </form>
        );
    };