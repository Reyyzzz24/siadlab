import React, { useRef, useEffect } from 'react';
import { FunnelIcon, ChevronDownIcon, CalendarIcon } from '@heroicons/react/24/outline'; // Tambah CalendarIcon
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Pastikan shadcn input diimport
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// --- Sub-komponen untuk Filter Select (Eksisting) ---
interface FilterItemProps {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onValueChange: (value: string) => void;
    placeholder?: string;
}

export const FilterItem = ({ label, value, options, onValueChange, placeholder = "Semua" }: FilterItemProps) => (
    <div className="space-y-2">
        <Label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
        </Label>
        <Select
            value={value || "all"}
            onValueChange={(val) => {
                const finalValue = val === "all" ? "" : val;
                onValueChange(finalValue);
            }}
        >
            <SelectTrigger className="w-full h-9 text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-primary">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent position="popper" className="z-[70] dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all" className="dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">
                    {placeholder}
                </SelectItem>
                {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);

// --- Sub-komponen BARU untuk Filter Tanggal ---
interface FilterDateItemProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export const FilterDateItem = ({ label, value, onChange }: FilterDateItemProps) => {
    const dateInputRef = React.useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {label}
            </Label>
            <div
                className="relative cursor-pointer"
                onClick={() => dateInputRef.current?.showPicker()}
            >
                <Input
                    ref={dateInputRef}
                    type="date"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-9 text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-primary pr-10 cursor-pointer 
                               [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:appearance-none"
                />
                {/* Ikon Heroicons kita letakkan di posisi yang benar */}
                <CalendarIcon className="w-4 h-4 absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
            </div>
        </div>
    );
};

// --- Komponen Utama ---
interface FilterDropdownProps {
    children: React.ReactNode;
    onReset?: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const FilterDropdown = ({ children, onReset, isOpen, onOpenChange }: FilterDropdownProps) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Agar dropdown tidak tertutup saat memilih tanggal di date picker browser atau radix select
            const isSelectOption = target.closest('[data-radix-select-viewport]') || target.closest('[role="option"]');

            if (isSelectOption) return;

            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                onOpenChange(false);
            }
        };

        if (isOpen) {
            document.addEventListener("pointerdown", handleClickOutside);
        }
        return () => document.removeEventListener("pointerdown", handleClickOutside);
    }, [isOpen, onOpenChange]);

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(!isOpen)}
                className="flex items-center gap-1 shrink-0 h-10 border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
                <FunnelIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">Filters</span>
                <ChevronDownIcon className={`w-3 h-3 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isOpen && (
                <div
                    className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 p-5 space-y-4 animate-in fade-in zoom-in duration-150"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <div className="space-y-4">
                        {children}
                    </div>

                    <div className="flex gap-2 pt-3">
                        {onReset && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                                onClick={onReset}
                            >
                                Reset
                            </Button>
                        )}
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                        >
                            Terapkan
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};