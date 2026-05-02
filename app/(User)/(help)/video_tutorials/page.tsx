"use client";

import { useState, useMemo } from "react";
import { Play, X, Loader2 } from "lucide-react";
import Image from "next/image";
import HelpCenterHeader from '@/components/help/HelpCenterHeader';
import CategoryTabs from '@/components/help/CategoryTabs';
import { useGetAllVideoFaqsQuery, useIncrementVideoViewMutation } from "@/redux/api/users/faqTutorialApi";

const categoryMap: any = {
    'All': undefined,
    'Device Management': 'DEVICEMANAGEMENT',
    'Content & Playlists': 'CONTENT_PLAYLIST',
    'Schedule': 'SCHEDULE',
    'Billing & Subscriptions': 'BILLANDSUBCRIPTION',
};

const getVideoUrl = (url: string) => {
    if (!url) return '';
    
    let cleanUrl = url.trim();
    if (cleanUrl.startsWith('/')) {
        cleanUrl = cleanUrl.substring(1);
    }

    if (cleanUrl.startsWith('uploads/')) {
        return `https://lawaltwo.sakibalhasa.xyz/${cleanUrl}`;
    }

    if (cleanUrl.includes('youtube.com/watch?v=')) {
        const videoId = cleanUrl.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    if (cleanUrl.includes('youtu.be/')) {
        const videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }

    return cleanUrl;
};

const VideoTutorials = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

    const categories = ["All", "Device Management", "Content & Playlists", "Schedule", "Billing & Subscriptions"];

    // API Query
    const { data: videosData, isLoading } = useGetAllVideoFaqsQuery({
        search: searchQuery || undefined,
        category: categoryMap[selectedCategory],
        status: 'PUBLISHED',
        page: 1,
        limit: 100
    });

    const [incrementView] = useIncrementVideoViewMutation();

    const videos = videosData?.data?.items || [];

    const openVideoModal = async (video: any) => {
        setSelectedVideo(video);
        document.body.style.overflow = "hidden";
        try {
            await incrementView(video.id).unwrap();
        } catch (err) {
            console.error('Failed to increment video view:', err);
        }
    };

    const closeVideoModal = () => {
        setSelectedVideo(null);
        document.body.style.overflow = "unset";
    };

    return (
        <div className="min-h-screen w-full max-w-[1920px] mx-auto pb-12">
            <HelpCenterHeader
                title="Video Tutorials"
                description="Find answers and inspiration on all things tape."
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <div className="px-4 sm:px-6 lg:px-8 mb-8">
                <CategoryTabs
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />

                {/* Video Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-bgBlue" />
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No video tutorials found.
                        </div>
                    ) : (
                        videos.map((video: any) => {
                            const videoUrl = getVideoUrl(video.videoLink || video.uploadVideo);
                            const isDirectFile = videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.includes('uploads/');
                            
                            // Simple thumbnail fallback
                            const thumbnail = "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop";

                            return (
                                <div
                                    key={video.id}
                                    onClick={() => openVideoModal(video)}
                                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                                        {(() => {
                                            const url = video.videoLink || video.uploadVideo;
                                            const videoUrl = getVideoUrl(url);
                                            
                                            // YouTube Thumbnail
                                            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                                                let videoId = '';
                                                if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
                                                else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
                                                
                                                return (
                                                    <Image
                                                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                                        alt={video.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        unoptimized
                                                    />
                                                );
                                            }

                                            // Direct Video Thumbnail (First frame)
                                            return (
                                                <video 
                                                    src={`${videoUrl}#t=0.1`} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    preload="metadata"
                                                    muted
                                                />
                                            );
                                        })()}
                                        
                                        {/* Play button overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/80 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 ml-1 fill-current" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <div className="p-4 sm:p-5">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-1 truncate">
                                            {video.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {video.answer}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Video Modal */}
                {selectedVideo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
                        <div className="absolute inset-0" onClick={closeVideoModal} />
                        <div className="relative w-full max-w-5xl bg-black rounded-xl overflow-hidden shadow-2xl animate-scaleIn">
                            <button
                                onClick={closeVideoModal}
                                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="relative w-full aspect-video bg-black">
                                {(() => {
                                    const url = getVideoUrl(selectedVideo.videoLink || selectedVideo.uploadVideo);
                                    const isDirect = url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('uploads/');
                                    
                                    if (isDirect) {
                                        return <video src={url} controls autoPlay className="absolute inset-0 w-full h-full" />;
                                    }
                                    return (
                                        <iframe
                                            src={`${url}?autoplay=1`}
                                            className="absolute top-0 left-0 w-full h-full"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    );
                                })()}
                            </div>

                            <div className="p-6 bg-navbarBg border-t border-border">
                                <h2 className="text-xl sm:text-2xl font-bold text-headings mb-2">
                                    {selectedVideo.title}
                                </h2>
                                <p className="text-gray-500 text-sm sm:text-base">
                                    {selectedVideo.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
        </div>
    );
};

export default VideoTutorials;
