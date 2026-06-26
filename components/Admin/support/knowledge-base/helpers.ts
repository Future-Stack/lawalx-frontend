export const formatCategory = (cat: string) => {
    if (!cat) return '';
    const map: Record<string, string> = {
        'DEVICEMANAGEMENT': 'Device Management',
        'CONTENT_PLAYLIST': 'Content & Playlists',
        'SCHEDULE': 'Schedule',
        'BILLANDSUBCRIPTION': 'Billing & Subscriptions',
        'SUBCRIPTION': 'Subscription'
    };
    return map[cat] || cat;
};

export const getVideoUrl = (url: string) => {
    if (!url) return '';

    // Direct file upload handling
    let cleanUrl = url.trim();
    if (cleanUrl.startsWith('/')) {
        cleanUrl = cleanUrl.substring(1);
    }

    if (cleanUrl.startsWith('uploads/')) {
        return `https://lawaltwo.sakibalhasa.xyz/${cleanUrl}`;
    }

    // YouTube handling
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
