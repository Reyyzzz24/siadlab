import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
    noPadding?: boolean;
}

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = 'md',
    noPadding = false
}: ModalProps) => {

    const maxWidthClasses = {
        'md': 'sm:max-w-md',
        'lg': 'sm:max-w-lg',
        'xl': 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',
        'full': 'sm:max-w-[95vw]'
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className={cn(
                    "p-0 overflow-hidden rounded-2xl border-none shadow-2xl gap-0",
                    maxWidthClasses[maxWidth]
                )}
            >
                {/* Header Section */}
                <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <DialogTitle className="text-base font-bold text-gray-800 dark:text-gray-200">
                        {title || 'Pemberitahuan'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Deskripsi untuk dialog {title || 'Pemberitahuan'}
                    </DialogDescription>
                </DialogHeader>

                {/* Body Section */}
                <div className={cn(
                    "max-h-[70vh] overflow-y-auto",
                    noPadding ? "" : "p-6"
                )}>
                    {children}
                </div>

                {/* Footer Section */}
                {footer && (
                    <DialogFooter className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 sm:justify-between flex flex-row gap-3">
                        {footer}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};