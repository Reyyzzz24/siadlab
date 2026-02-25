import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface OutgoingMailFormProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isEditMode: boolean;
    nextAgendaNumber?: string;
}

export const OutgoingMailForm = ({ data, setData, errors, processing, onSubmit, onCancel, isEditMode, nextAgendaNumber }: OutgoingMailFormProps) => {

    React.useEffect(() => {
        if (isEditMode === false && !data.no_agenda && nextAgendaNumber) {
            setData('no_agenda', nextAgendaNumber);
        }
    }, [nextAgendaNumber, isEditMode]);

    return (
        <form id="mail-form" onSubmit={onSubmit} className="space-y-4 text-gray-800">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="no_agenda">No. Agenda</Label>
                    <Input id="no_agenda" value={data.no_agenda || ''} onChange={e => setData('no_agenda', e.target.value)} placeholder="001" className={`${errors.no_agenda ? "border-red-500" : ""} font-bold bg-gray-50`} />
                    {errors.no_agenda && <p className="text-red-500 text-xs mt-1">{errors.no_agenda}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="no_surat">No. Surat</Label>
                    <Input id="no_surat" value={data.no_surat || ''} onChange={e => setData('no_surat', e.target.value)} placeholder="Contoh: 001/SK/2026" className={errors.no_surat ? "border-red-500" : ""} />
                    {errors.no_surat && <p className="text-red-500 text-xs mt-1">{errors.no_surat}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="tujuan_surat">Tujuan Surat</Label>
                <Input id="tujuan_surat" value={data.tujuan_surat || ''} onChange={e => setData('tujuan_surat', e.target.value)} placeholder="Tujuan surat..." className={errors.tujuan_surat ? "border-red-500" : ""} />
                {errors.tujuan_surat && <p className="text-red-500 text-xs mt-1">{errors.tujuan_surat}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="tanggal_surat">Tanggal Surat</Label>
                    <Input id="tanggal_surat" type="date" value={data.tanggal_surat || ''} onChange={e => setData('tanggal_surat', e.target.value)} className={errors.tanggal_surat ? "border-red-500" : ""} />
                    {errors.tanggal_surat && <p className="text-red-500 text-xs mt-1">{errors.tanggal_surat}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="file_surat">{isEditMode ? 'Ganti File (Opsional)' : 'File Surat (PDF/JPG)'} </Label>
                    <div className="flex flex-col gap-1">
                        <Input id="file_surat" type="file" onChange={e => setData('file', e.target.files ? e.target.files[0] : null)} className={`cursor-pointer file:font-semibold file:text-sm ${errors.file ? "border-red-500" : ""}`} />
                        {isEditMode && data.file_surat && !data.file && <p className="text-[10px] text-muted-foreground italic truncate">File lama: {data.file_surat.split('/').pop()}</p>}
                    </div>
                    {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="perihal">Perihal</Label>
                <Textarea id="perihal" value={data.perihal || ''} onChange={e => setData('perihal', e.target.value)} placeholder="Isi ringkasan perihal surat..." rows={3} className={errors.perihal ? "border-red-500" : ""} />
                {errors.perihal && <p className="text-red-500 text-xs mt-1">{errors.perihal}</p>}
            </div>
        </form>
    );
};
