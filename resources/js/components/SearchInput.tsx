import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Input } from "@/components/ui/input";

interface SearchInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; // Tambahkan ini
    placeholder?: string;
    className?: string;
}
// Tambahkan 'export' di sini dan hapus 'export default' di bawah
export const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    onSubmit,
    onKeyDown, // Ambil dari props
    placeholder = "Cari...",
    className = "w-64"
}) => {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="relative"
        >
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
                type="text"
                name="search"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown} // Pasang di sini
                className={`pl-10 w-64 h-10 ${className}`}
            />
        </form>
    );
};