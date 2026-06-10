import Image from "next/image";
import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { Banner } from "@/redux/api/users/userBanner/userBanner.type";

interface GoLiveBannerProps {
    banner?: Banner;
}

const GoLiveBanner = ({ banner }: GoLiveBannerProps) => {
    const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const imageBaseUrl = envBaseUrl.replace(/\/api\/v1\/?$/, "");

    // Check if it's a prebuilt banner
    const isPrebuilt = banner ? (!!banner.uploadBanner || !!banner.bannerLinkRedirectURL) : false;

    if (isPrebuilt) {
        const prebuiltMediaUrl = banner?.uploadBanner
            ? (banner.uploadBanner.startsWith("http") ? banner.uploadBanner : `${imageBaseUrl}/${banner.uploadBanner.startsWith("/") ? banner.uploadBanner.slice(1) : banner.uploadBanner}`)
            : null;
        
        const isVideo = prebuiltMediaUrl?.match(/\.(mp4|webm|ogg)$/i);

        return (
            <div className="mb-6">
                <a 
                    href={banner?.bannerLinkRedirectURL || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-95 transition-opacity block group/prebuilt relative rounded-xl shadow-lg border border-border max-h-[180px] md:max-h-[300px]"
                    onClick={(e) => {
                        if (!banner?.bannerLinkRedirectURL) e.preventDefault();
                    }}
                >
                    {prebuiltMediaUrl ? (
                        <>
                            {isVideo ? (
                                <video
                                    src={prebuiltMediaUrl}
                                    className="w-full h-full object-contain"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={prebuiltMediaUrl}
                                    alt={banner?.title || "Full Banner"}
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </>
                    ) : (
                        <div className="w-full aspect-[21/9] md:aspect-[4/1] flex flex-col items-center justify-center text-gray-400">
                        </div>
                    )}
                </a>
            </div>
        );
    }

    // Custom or default banner mode
    const fullImageUrl = banner?.mediaUrl 
        ? (banner.mediaUrl.startsWith("http") ? banner.mediaUrl : `${imageBaseUrl}/${banner.mediaUrl.startsWith("/") ? banner.mediaUrl.slice(1) : banner.mediaUrl}`)
        : "/userDashboard/img3.webp";

    const isVideo = banner?.mediaUrl?.match(/\.(mp4|webm|ogg)$/i) || banner?.mediaType === 'VIDEO';

    const PrimaryIcon = banner?.primaryButtonIcon && banner?.primaryButtonIcon !== 'none'
        ? (Icons as unknown as Record<string, LucideIcon>)[banner.primaryButtonIcon]
        : (banner ? null : ArrowUpRight);

    const SecondaryIcon = banner?.secondaryButtonIcon && banner?.secondaryButtonIcon !== 'none'
        ? (Icons as unknown as Record<string, LucideIcon>)[banner.secondaryButtonIcon]
        : null;

    const showPrimaryButton = banner ? Boolean(banner.primaryButtonLabel?.trim()) : true;
    const showSecondaryButton = banner ? Boolean(banner.secondaryButtonEnabled && banner.secondaryButtonLabel?.trim()) : false;

    const backgroundStyle = banner
        ? (banner.backgroundStyle === 'GRADIENT'
            ? `linear-gradient(${banner.backgroundDirection || 'to right'}, ${banner.backgroundColor1 || '#005C97'}, ${banner.backgroundColor2 || '#363795'})`
            : (banner.backgroundColor1 || '#005C97'))
        : undefined;

    const getClipPath = (shape?: string) => {
        switch (shape?.toLowerCase()) {
            case 'circle': return 'circle(50% at 50% 50%)';
            case 'star': return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
            case 'hexagon': return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
            case 'diamond': return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
            case 'triangle': return 'polygon(50% 0%, 0% 100%, 100% 100%)';
            default: return 'none';
        }
    };

    const imageStyles = banner ? {
        height: banner.mediaHeight ? Math.min(banner.mediaHeight, 165) : 165,
        width: banner.mediaWidth ? Math.min(banner.mediaWidth, 165) : 165,
        transform: "scale(1.25)",
        clipPath: getClipPath(banner.mediaShape),
    } : {
        transform: "scale(1.25)",
    };

    // Replicate flex layouts depending on Left/Right positioning
    const isLeftPosition = banner?.mediaPosition === 'LEFT';
    const flexContainerClass = banner 
        ? `flex items-center justify-between mb-6 p-6 rounded-xl shadow-lg relative overflow-hidden min-h-[250px] ${isLeftPosition ? 'flex-row-reverse' : 'flex-row'}`
        : "flex items-center justify-center md:justify-between mb-6 dashboard-header-bg p-6 rounded-xl relative overflow-hidden min-h-[250px]";

    const textMarginClass = banner
        ? (isLeftPosition ? 'mr-0 md:mr-0 lg:mr-10' : 'ml-0 md:ml-0 lg:ml-10')
        : 'ml-0 md:ml-0 lg:ml-10';

    return (
        <div 
            className={flexContainerClass}
            style={backgroundStyle ? { background: backgroundStyle, minHeight: '250px' } : { minHeight: '250px' }}
        >
            <div className={`space-y-2 z-10 ${textMarginClass}`}>
                <h1
                    className="text-[24px] md:text-[32px] font-semibold text-white leading-tight tracking-[-0.64px]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                >
                    {banner?.title || "Go Live on Any Program Instantly"}
                </h1>
                <p
                    className="text-[14px] md:text-[16px] text-white/85 font-normal leading-normal tracking-[-0.32px]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                >
                    {banner?.description || "Create your first program and start displaying your content in minutes."}
                </p>
                
                {(showPrimaryButton || showSecondaryButton) && (
                    <div className="flex flex-wrap items-center gap-3 mt-6">
                        {showPrimaryButton && (
                            <a
                                href={banner?.primaryButtonUrl || "/choose-plan"}
                                onClick={(e) => { if (!banner?.primaryButtonUrl) e.preventDefault(); }}
                                className={
                                    banner
                                        ? "inline-flex relative z-10 pointer-events-auto px-6 py-2.5 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors items-center justify-center gap-2 shadow-customShadow cursor-pointer"
                                        : "bg-bgBlue hover:bg-blue-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg flex items-center justify-center gap-1 text-sm md:text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out shadow-customShadow min-w-40 pt-2"
                                }
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                {banner?.primaryButtonLabel || "Upgrade"} {PrimaryIcon && <PrimaryIcon className="w-5 h-5" />}
                            </a>
                        )}

                        {showSecondaryButton && (
                            <a
                                href={banner?.secondaryButtonUrl || "#"}
                                onClick={(e) => { if (!banner?.secondaryButtonUrl) e.preventDefault(); }}
                                className="inline-flex relative z-10 pointer-events-auto px-6 py-2.5 bg-blue-800/30 text-white border border-blue-400/30 rounded-lg font-medium hover:bg-blue-800/50 transition-colors backdrop-blur-sm items-center justify-center gap-2 shadow-customShadow cursor-pointer"
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                {banner?.secondaryButtonLabel} {SecondaryIcon && <SecondaryIcon className="w-5 h-5" />}
                            </a>
                        )}
                    </div>
                )}
            </div>

            <div className={`md:block hidden z-10 ${banner ? (isLeftPosition ? 'md:ml-2 lg:ml-4 xl:ml-10' : 'md:mr-2 lg:mr-4 xl:mr-10') : 'md:mr-2 lg:mr-4 xl:mr-10'}`}>
                {banner?.mediaUrl ? (
                    isVideo ? (
                        <video
                            src={fullImageUrl}
                            style={imageStyles}
                            className={banner.mediaShape && banner.mediaShape !== 'original' ? "object-cover" : "object-contain"}
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                    ) : (
                        <img
                            src={fullImageUrl}
                            alt={banner?.title || "Banner Image"}
                            style={imageStyles}
                            className={banner.mediaShape && banner.mediaShape !== 'original' ? "object-cover" : "object-contain"}
                        />
                    )
                ) : (
                    <Image
                        src={fullImageUrl}
                        alt={banner?.title || "Dashboard Header"}
                        height={165}
                        width={165}
                        style={{ transform: "scale(1.25)" }}
                        unoptimized={!!banner?.mediaUrl}
                    />
                )}
            </div>
        </div>
    );
};

export default GoLiveBanner;
