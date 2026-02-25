import React from 'react';
import { Label } from "./label";

interface FormGroupProps {
    label: string;
    children: React.ReactNode;
    className?: string;
}

export function FormGroup({ label, children, className }: FormGroupProps) {
    return (
        <div className={className}>
            <Label>{label}</Label>
            {children}
        </div>
    );
}