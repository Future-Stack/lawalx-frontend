import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getVideoUrl } from './helpers';

interface VideoPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ isOpen, onClose, videoUrl }) => {
    if (!videoUrl) return null;

    const fullUrl = getVideoUrl(videoUrl);
    const isDirectFile = fullUrl.endsWith('.mp4') || fullUrl.endsWith('.webm') || fullUrl.includes('uploads/');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl bg-black border-none rounded-2xl p-0 overflow-hidden">
                <DialogTitle className="sr-only">Video Preview</DialogTitle>
                <div className="aspect-video w-full bg-black flex items-center justify-center">
                    {isDirectFile ? (
                        <video
                            src={fullUrl}
                            controls
                            autoPlay
                            className="w-full h-full"
                        />
                    ) : (
                        <iframe
                            src={fullUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
            </DialogContent>
        </Dialog>
    );
};

export default VideoPlayerModal;
