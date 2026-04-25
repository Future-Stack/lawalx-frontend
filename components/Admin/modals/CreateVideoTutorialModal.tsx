'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, HelpCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
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

export interface VideoTutorialData {
    id?: string;
    title: string;
    description?: string;
    videoType: 'Upload' | 'Link';
    videoSource: string; // URL or File name mockup
    category: string;
    status: 'Draft' | 'Published';
}

interface CreateVideoTutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: VideoTutorialData) => void;
    initialData?: VideoTutorialData | null;
}

const CATEGORIES = [
    'Device Management',
    'Content & Playlists',
    'Schedule',
    'Billing & Subscriptions'
];

export default function CreateVideoTutorialModal({ isOpen, onClose, onSave, initialData }: CreateVideoTutorialModalProps) {
    const [title, setTitle] = useState('');
    const [answer, setAnswer] = useState('');
    const [videoLink, setVideoLink] = useState('');
    const [category, setCategory] = useState('');
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setAnswer(initialData.description || '');
                setVideoLink(initialData.videoType === 'Link' ? initialData.videoSource : '');
                setFileName(initialData.videoType === 'Upload' ? initialData.videoSource : '');
                setCategory(initialData.category);
            } else {
                setTitle('');
                setAnswer('');
                setVideoLink('');
                setFileName('');
                setCategory('');
            }
        }
    }, [isOpen, initialData]);

    const handleSave = (publish: boolean) => {
        onSave({
            id: initialData?.id,
            title,
            description: answer,
            videoType: videoLink ? 'Link' : 'Upload',
            videoSource: videoLink || fileName || 'video_placeholder.mp4',
            category,
            status: publish ? 'Published' : 'Draft'
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false} className="max-w-2xl p-0 bg-white dark:bg-cardBg border-none rounded-2xl overflow-hidden focus:outline-none">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/50">
                    <DialogTitle className="text-xl font-bold text-headings">
                        {initialData ? 'Edit Tutorial' : 'Create Tutorial'}
                    </DialogTitle>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer group">
                        <X className="w-5 h-5 text-muted group-hover:text-red-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-headings">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Business"
                            className="w-full h-11 px-4 text-sm bg-navbarBg dark:bg-inputBg border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-bgBlue/30 focus:border-bgBlue border transition-all placeholder:text-muted/50 text-headings"
                        />
                    </div>

                    {/* Answer (Description) */}
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-headings">
                            Answer
                        </label>
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder={`Displays "Export Failed: Unknown Error". I've tried this on multiple browsers (Chrome, Firefox, and Edge) with the same result.`}
                            className="w-full h-24 p-4 text-sm bg-navbarBg dark:bg-inputBg border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-bgBlue/30 focus:border-bgBlue border resize-none transition-all placeholder:text-muted/50 text-headings"
                        />
                    </div>

                    {/* Video Category */}
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-headings">
                            Video Catagory
                        </label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full h-11 rounded-xl bg-navbarBg dark:bg-inputBg border-border focus:ring-2 focus:ring-bgBlue/30 transition-all text-headings">
                                <SelectValue placeholder="Subscription" />
                            </SelectTrigger>
                            <SelectContent className="z-[2147483647]">
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                                <SelectItem value="Subscription">Subscription</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Video Link */}
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-headings">
                            Video Link
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted text-sm border-r border-border pr-3">
                                https://
                            </div>
                            <input
                                type="text"
                                value={videoLink}
                                onChange={(e) => setVideoLink(e.target.value)}
                                placeholder="tape.io"
                                className="w-full h-11 pl-20 pr-10 text-sm bg-navbarBg dark:bg-inputBg border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-bgBlue/30 focus:border-bgBlue border transition-all placeholder:text-muted/50 text-headings"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <HelpCircle className="w-4 h-4 text-muted" />
                            </div>
                        </div>
                    </div>

                    {/* Upload Video */}
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-headings">
                            Upload Video
                        </label>
                        <div className="border border-border dark:border-borderColor rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group">
                            <div className="w-10 h-10 mb-2 bg-navbarBg dark:bg-gray-800 rounded-lg flex items-center justify-center border border-border group-hover:border-bgBlue/50 transition-colors">
                                <Upload className="w-5 h-5 text-muted group-hover:text-bgBlue transition-colors" />
                            </div>
                            <p className="text-sm font-bold text-bgBlue mb-0.5">Click to Upload <span className="text-muted font-medium">or drag and drop</span></p>
                            <p className="text-[10px] text-muted">SVG, PNG, or JPG (Max 800 × 800px)</p>
                            {fileName && <p className="mt-2 text-sm text-green-500 font-bold">{fileName}</p>}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4">
                        <Button
                            variant="outline"
                            className="rounded-xl h-11 px-6 font-bold border-border text-headings hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-bgBlue dark:hover:text-bgBlue shadow-sm transition-all cursor-pointer"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="rounded-xl h-11 px-6 font-bold border-border text-headings hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-bgBlue dark:hover:text-bgBlue shadow-sm transition-all cursor-pointer"
                                onClick={() => handleSave(false)}
                            >
                                Save
                            </Button>
                            <Button
                                className="rounded-xl h-11 px-6 font-bold bg-bgBlue hover:bg-blue-600 text-white shadow-customShadow transition-all cursor-pointer"
                                onClick={() => handleSave(true)}
                            >
                                Publish
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
