'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    itemName?: string;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Report",
    description = "Are you sure you want to delete this report? This action cannot be undone.",
    itemName
}: DeleteConfirmationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md p-0 bg-white dark:bg-gray-900 border-none rounded-3xl overflow-hidden focus:outline-none shadow-2xl">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-800 mx-auto mb-6 shadow-customShadow">
                        <Trash2 className="w-8 h-8 text-red-500" />
                    </div>

                    <DialogHeader className="p-0 space-y-2">
                        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white text-center">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 text-center px-4">
                            {description}
                            {itemName && (
                                <span className="block mt-2 font-bold text-gray-900 dark:text-white italic">
                                    "{itemName}"
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-8 flex items-center gap-4">
                        <Button
                            className="flex-1 rounded-xl h-12 font-bold border-border hover:bg-gray-50 shadow-customShadow text-body"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 rounded-xl h-12 font-bold bg-red-500 hover:bg-red-600 text-white shadow-customShadow"
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
