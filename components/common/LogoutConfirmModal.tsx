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
import { LogOut } from 'lucide-react';

interface LogoutConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function LogoutConfirmModal({
    isOpen,
    onClose,
    onConfirm,
}: LogoutConfirmModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md p-0 bg-white dark:bg-gray-900 border-none rounded-3xl overflow-hidden focus:outline-none shadow-2xl">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-800 mx-auto mb-6 shadow-customShadow">
                        <LogOut className="w-8 h-8 text-red-500" />
                    </div>

                    <DialogHeader className="p-0 space-y-2">
                        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white text-center">
                            Are you sure?
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 text-center px-4">
                            Are you sure you want to logout? You will need to login again to access your account.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-8 flex items-center gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-xl h-12 font-bold border-border hover:bg-gray-50 shadow-customShadow text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
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
                            Logout
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
