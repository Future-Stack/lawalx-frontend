'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, CloudUpload } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

export interface FAQData {
    id?: string;
    question: string;
    answer: string;
    category: string;
    status: 'Draft' | 'Published';
}

import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const CATEGORIES = [
    { label: 'Device Management', value: 'DEVICEMANAGEMENT' },
    { label: 'Content & Playlists', value: 'CONTENT_PLAYLIST' },
    { label: 'Schedule', value: 'SCHEDULE' },
    { label: 'Billing & Subscriptions', value: 'BILLANDSUBCRIPTION' },
    { label: 'Subscription', value: 'SUBCRIPTION' }
];

interface CreateFAQModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FAQData) => void;
    initialData?: FAQData | null;
    isSaving?: boolean;
}

export default function CreateFAQModal({ isOpen, onClose, onSave, initialData, isSaving }: CreateFAQModalProps) {
    const [title, setTitle] = useState('');
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('');
    const [clickedButton, setClickedButton] = useState<'save' | 'publish' | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.question);
                setAnswer(initialData.answer);
                setCategory(initialData.category);
            } else {
                setTitle('');
                setAnswer('');
                setCategory('');
            }
            setClickedButton(null);
        }
    }, [isOpen, initialData]);

    const handleSave = (publish: boolean) => {
        setClickedButton(publish ? 'publish' : 'save');
        onSave({
            id: initialData?.id,
            question: title,
            answer,
            category,
            status: publish ? 'Published' : 'Draft'
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false} className="max-w-2xl p-0 bg-white dark:bg-cardBg border-none rounded-2xl overflow-hidden focus:outline-none">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/50">
                    <DialogTitle className="text-xl font-bold text-headings">
                        {initialData ? 'Edit FAQ' : 'Create FAQ'}
                    </DialogTitle>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer group">
                        <X className="w-5 h-5 text-muted group-hover:text-red-500" />
                    </button>
                </div>

                <div className="p-6 space-y-7">
                    {/* Title / Question */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-headings">
                            Question
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="How do I reset my password?"
                            className="w-full h-12 px-4 text-sm bg-navbarBg dark:bg-inputBg border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-bgBlue/30 focus:border-bgBlue border transition-all placeholder:text-muted/50 text-headings"
                        />
                    </div>

                    {/* Answer */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-headings">
                            Answer
                        </label>
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder={`To reset your password, click on "Forgot Password" on the login page and follow the instructions sent to your email.`}
                            className="w-full h-32 p-4 text-sm bg-navbarBg dark:bg-inputBg border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-bgBlue/30 focus:border-bgBlue border resize-none transition-all placeholder:text-muted/50 text-headings"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-headings">
                            Category
                        </label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full h-12 rounded-xl bg-navbarBg dark:bg-inputBg border-border focus:ring-2 focus:ring-bgBlue/30 transition-all text-headings">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="z-[2147483647]">
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6">
                        <Button
                            variant="outline"
                            className="rounded-xl h-12 px-8 font-bold border-border text-headings hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-bgBlue dark:hover:text-bgBlue shadow-sm transition-all cursor-pointer"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                disabled={isSaving}
                                className="rounded-xl h-12 px-8 font-bold border-border text-headings hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-bgBlue dark:hover:text-bgBlue shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleSave(false)}
                            >
                                {isSaving && clickedButton === 'save' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Save
                            </Button>
                            <Button
                                disabled={isSaving}
                                className="rounded-xl h-12 px-8 font-bold bg-bgBlue hover:bg-blue-600 text-white shadow-customShadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleSave(true)}
                            >
                                {isSaving && clickedButton === 'publish' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Publish
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
