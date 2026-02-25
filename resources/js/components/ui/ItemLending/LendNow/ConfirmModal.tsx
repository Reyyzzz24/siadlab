// resources/js/components/ui/ItemLending/Lending/ConfirmModal.tsx

import React from 'react';
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'success' | 'warning';
    isLoading?: boolean;
}

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Ya, Lanjutkan",
    cancelText = "Batal",
    variant = 'success',
    isLoading = false
}: ConfirmModalProps) => {
    
    const variantConfig = {
        danger: {
            icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />,
            bgIcon: "bg-red-100",
            btn: "bg-red-600 hover:bg-red-700"
        },
        success: {
            icon: <InformationCircleIcon className="w-6 h-6 text-green-600" />,
            bgIcon: "bg-green-100",
            btn: "bg-green-600 hover:bg-green-700"
        },
        warning: {
            icon: <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />,
            bgIcon: "bg-amber-100",
            btn: "bg-amber-600 hover:bg-amber-700"
        }
    };

    const config = variantConfig[variant];

    return (
        // Ubah maxWidth dari "sm" ke "md" untuk memperbaiki error TypeScript
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
            <div className="p-1">
                <div className="flex items-start gap-4 mb-6">
                    <div className={`p-3 rounded-full shrink-0 ${config.bgIcon}`}>
                        {config.icon}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {message}
                    </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                    <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button 
                        className={`flex-1 text-white ${config.btn}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memproses...' : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};