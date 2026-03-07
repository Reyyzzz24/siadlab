import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserFormProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    onSubmit: (e: React.FormEvent) => void;
    isEditMode: boolean;
    availableRoles: string[];
}

export const UserForm = ({ data, setData, errors, onSubmit, isEditMode, availableRoles }: UserFormProps) => {
    return (
        <form id="user-form" onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>

            <div className="space-y-1">
                <Label htmlFor="password">
                    Password {isEditMode && <span className="text-[10px] text-gray-400">(Kosongkan jika tidak ganti)</span>}
                </Label>
                <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={e => setData('password', e.target.value)}
                    className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </div>

            <div className="space-y-1">
                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                <Input
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation || ''} // Tambahkan ini di state inertia kamu
                    onChange={e => setData('password_confirmation', e.target.value)}
                    className={errors.password_confirmation ? "border-red-500" : ""}
                />
                {errors.password_confirmation && (
                    <p className="text-red-500 text-xs">{errors.password_confirmation}</p>
                )}
            </div>

            <div className="space-y-1">
                <Label>Role</Label>
                <Select value={data.role} onValueChange={val => setData('role', val)}>
                    <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                        <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableRoles.map(r => (
                            <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
            </div>
        </form>
    );
};