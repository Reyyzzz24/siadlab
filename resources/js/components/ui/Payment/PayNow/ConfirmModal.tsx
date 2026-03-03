import React from 'react';
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'success' | 'warning' | 'info';
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
            btn: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
        },
        success: {
            icon: <CheckCircleIcon className="w-6 h-6 text-emerald-600" />,
            bgIcon: "bg-emerald-100",
            btn: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
        },
        warning: {
            icon: <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />,
            bgIcon: "bg-amber-100",
            btn: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
        },
        info: {
            icon: <InformationCircleIcon className="w-6 h-6 text-blue-600" />,
            bgIcon: "bg-blue-100",
            btn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        }
    };

    const config = variantConfig[variant];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
            <div className="p-1">
                <div className="flex items-start gap-4 mb-6">
                    <div className={`p-3 rounded-full shrink-0 ${config.bgIcon}`}>
                        {config.icon}
                    </div>
                    <div className="mt-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {message}
                        </p>
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
                        className={`flex-1 text-white border-0 ${config.btn}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Memproses...
                            </div>
                        ) : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};