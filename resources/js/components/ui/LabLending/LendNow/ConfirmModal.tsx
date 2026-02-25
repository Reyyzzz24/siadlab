import React from 'react';
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'destructive' | 'default';
}

export const ConfirmModal = ({ 
    isOpen, onClose, onConfirm, title, message, confirmText = "Ya, Lanjutkan", variant = "default" 
}: ConfirmModalProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="flex flex-col items-center text-center">
            <div className={`p-3 rounded-full mb-4 ${variant === 'destructive' ? 'bg-red-50' : 'bg-blue-50'}`}>
                <ExclamationTriangleIcon className={`w-8 h-8 ${variant === 'destructive' ? 'text-red-600' : 'text-blue-600'}`} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            <div className="flex justify-center gap-3 w-full">
                <Button variant="outline" onClick={onClose} className="flex-1">Batal</Button>
                <Button 
                    variant={variant === 'destructive' ? 'destructive' : 'default'} 
                    onClick={() => { onConfirm(); onClose(); }}
                    className="flex-1"
                >
                    {confirmText}
                </Button>
            </div>
        </div>
    </Modal>
);