'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, HelpCircle, Play } from 'lucide-react';
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
import { cn } from '@/lib/utils';

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
    isSaving?: boolean;
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

export default function CreateVideoTutorialModal({ isOpen, onClose, onSave, initialData, isSaving }: CreateVideoTutorialModalProps) {
    const [title, setTitle] = useState('');
    const [answer, setAnswer] = useState('');
    const [videoLink, setVideoLink] = useState('');
    const [category, setCategory] = useState('');
    const [fileName, setFileName] = useState('');
    const [clickedButton, setClickedButton] = useState<'save' | 'publish' | null>(null);

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
            setClickedButton(null);
        }
    }, [isOpen, initialData]);

    const handleSave = (publish: boolean) => {
        const fileInput = document.getElementById('video-upload') as any;
        const file = fileInput?._file;

        setClickedButton(publish ? 'publish' : 'save');

        onSave({
            id: initialData?.id,
            title,
            description: answer,
            videoType: videoLink ? 'Link' : 'Upload',
            videoSource: videoLink || fileName || '',
            category,
            status: publish ? 'Published' : 'Draft',
            // @ts-ignore
            file: file
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
            <DialogContent showCloseButton={false} className="max-w-2xl p-0 bg-white dark:bg-cardBg border-none rounded-2xl overflow-hidden focus:outline-none">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/50">
                    <DialogTitle className="text-xl font-bold text-headings">
                        {initialData ? 'Edit Tutorial' : 'Create Tutorial'}
                    </DialogTitle>
                    <button disabled={isSaving} onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed">
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
                            disabled={isSaving}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Business"
                            className="w-full h-11 px-4 text-sm bg-navbarBg dark:bg-inputBg border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-bgBlue/30 focus:border-bgBlue border transition-all placeholder:text-muted/50 text-headings disabled:opacity-50"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-headings">
                            Description
                        </label>
                        <textarea
                            value={answer}
                            disabled={isSaving}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder={`Displays "Export Failed: Unknown Error". I've tried this on multiple browsers (Chrome, Firefox, and Edge) with the same result.`}
                            className="w-full h-24 p-4 text-sm bg-navbarBg dark:bg-inputBg border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-bgBlue/30 focus:border-bgBlue border resize-none transition-all placeholder:text-muted/50 text-headings disabled:opacity-50"
                        />
                    </div>

                    {/* Video Category */}
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-headings">
                            Video Category
                        </label>
                        <Select disabled={isSaving} value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full h-11 rounded-xl bg-navbarBg dark:bg-inputBg border-border focus:ring-2 focus:ring-bgBlue/30 transition-all text-headings disabled:opacity-50">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="z-[2147483647]">
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Video Link */}
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-headings">
                            Video Link
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={videoLink}
                                disabled={!!fileName || isSaving}
                                onChange={(e) => {
                                    if (fileName) {
                                        toast.warning("You can only provide either a video link or a file.");
                                        return;
                                    }
                                    setVideoLink(e.target.value);
                                }}
                                placeholder="https://tape.io/example"
                                className="w-full h-11 px-4 text-sm bg-navbarBg dark:bg-inputBg border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-bgBlue/30 focus:border-bgBlue border transition-all placeholder:text-muted/50 text-headings disabled:opacity-50"
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
                        <div
                            onClick={() => {
                                if (isSaving) return;
                                if (videoLink) {
                                    toast.warning("You can only provide either a video link or a file.");
                                    return;
                                }
                                document.getElementById('video-upload')?.click();
                            }}
                            className={cn(
                                "border border-border dark:border-borderColor rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group",
                                (videoLink || isSaving) && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <input
                                id="video-upload"
                                type="file"
                                accept="video/*"
                                className="hidden"
                                disabled={isSaving}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setFileName(file.name);
                                        // Store the file object itself if needed for FormData
                                        (e.target as any)._file = file;
                                    }
                                }}
                            />
                            <div className="w-10 h-10 mb-2 bg-navbarBg dark:bg-gray-800 rounded-lg flex items-center justify-center border border-border group-hover:border-bgBlue/50 transition-colors">
                                <Upload className="w-5 h-5 text-muted group-hover:text-bgBlue transition-colors" />
                            </div>
                            <p className="text-sm font-bold text-bgBlue mb-0.5">Click to Upload <span className="text-muted font-medium">or drag and drop</span></p>
                            {fileName && (
                                <div className="mt-2 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <Play className="w-3.5 h-3.5 text-bgBlue" />
                                    <span className="text-xs font-medium text-bgBlue truncate max-w-[200px]">{fileName}</span>
                                    <button
                                        type="button"
                                        disabled={isSaving}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFileName('');
                                            const fileInput = document.getElementById('video-upload') as any;
                                            if (fileInput) {
                                                fileInput.value = '';
                                                fileInput._file = null;
                                            }
                                        }}
                                        className="ml-auto p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full transition-colors disabled:opacity-50"
                                    >
                                        <X className="w-3.5 h-3.5 text-bgBlue" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4">
                        <Button
                            variant="outline"
                            disabled={isSaving}
                            className="rounded-xl h-11 px-6 font-bold border-border text-headings hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-bgBlue dark:hover:text-bgBlue shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                disabled={isSaving}
                                className="rounded-xl h-11 px-6 font-bold border-border text-headings hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-bgBlue dark:hover:text-bgBlue shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleSave(false)}
                            >
                                {isSaving && clickedButton === 'save' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Save
                            </Button>
                            <Button
                                disabled={isSaving}
                                className="rounded-xl h-11 px-6 font-bold bg-bgBlue hover:bg-blue-600 text-white shadow-customShadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
