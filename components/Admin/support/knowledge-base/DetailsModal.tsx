import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCategory } from './helpers';

interface DetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    type: 'FAQ' | 'Video';
}

export const DetailsModal: React.FC<DetailsModalProps> = ({ isOpen, onClose, data, type }) => {
    if (!data) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-navbarBg border-none rounded-2xl p-6">
                <DialogHeader className="border-b border-border/50 pb-4 mb-4">
                    <DialogTitle className="text-xl font-bold text-headings">
                        {type === 'FAQ' ? 'FAQ Details' : 'Video Tutorial Details'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 mb-1">{type === 'FAQ' ? 'Question' : 'Title'}</h4>
                        <p className="text-base font-semibold text-headings">{type === 'FAQ' ? data.question : data.title}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 mb-1">{type === 'FAQ' ? 'Answer' : 'Description'}</h4>
                        <p className="text-sm text-headings whitespace-pre-wrap">{data.answer}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 mb-1">Category</h4>
                            <Badge variant="default" className="text-bgBlue border-bgBlue/30 bg-bgBlue/5">
                                {Array.isArray(data.category)
                                    ? data.category.map((c: string) => formatCategory(c)).join(', ')
                                    : formatCategory(data.category)}
                            </Badge>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 mb-1">Status</h4>
                            <Badge className={cn(
                                data.status === 'PUBLISHED' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-gray-100 text-gray-600 border-gray-200",
                                "capitalize"
                            )}>
                                {data.status}
                            </Badge>
                        </div>
                    </div>
                    {type === 'Video' && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 mb-1">Video Source</h4>
                            {data.videoLink ? (
                                <a href={data.videoLink} target="_blank" rel="noopener noreferrer" className="text-bgBlue hover:underline text-sm break-all">
                                    {data.videoLink}
                                </a>
                            ) : data.uploadVideo ? (
                                <p className="text-sm text-headings">Uploaded Video: {data.uploadVideo}</p>
                            ) : (
                                <p className="text-sm text-muted italic">No video source provided</p>
                            )}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 mb-1">Created At</h4>
                            <p className="text-xs text-muted">{new Date(data.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 mb-1">Total Views</h4>
                            <p className="text-sm font-semibold text-headings">{data.totalView || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <Button onClick={onClose} className="bg-bgBlue hover:bg-blue-600 text-white rounded-xl px-8 cursor-pointer">Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DetailsModal;
