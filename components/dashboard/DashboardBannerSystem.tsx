"use client";

import { useState, useEffect } from "react";
import GoLiveBanner from "./banners/GoLiveBanner";
// import DownloadAppBanner from "./banners/DownloadAppBanner";
// import TrialBanner from "./banners/TrialBanner";
import { useGetUserBannerDataQuery } from "@/redux/api/users/userBanner/userBanner.api";
import { BannerType, Banner } from "@/redux/api/users/userBanner/userBanner.type";

const DashboardBannerSystem = () => {
    const { data, isLoading } = useGetUserBannerDataQuery(undefined);
    const [currentIndex, setCurrentIndex] = useState(0);

    const banners = data?.data || [];

    useEffect(() => {
        if (banners.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % banners.length);
            }, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [banners.length]);

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            <div className="h-40 bg-gray-200 rounded-xl"></div>
        </div>;
    }

    if (banners.length === 0) {
        return (
            <div className="flex flex-col gap-0">
                <GoLiveBanner />
                {/* <DownloadAppBanner /> */}
                {/* <TrialBanner /> */}
            </div>
        );
    }

    const currentBanner = banners[currentIndex];

    const renderBanner = (banner: Banner) => {
        switch (banner.type) {
            case BannerType.PROMOTION:
                return <GoLiveBanner banner={banner} />;
            // case BannerType.ANNOUNCEMENT:
            //     return <DownloadAppBanner banner={banner} />;
            // case BannerType.UPLOAD:
            //     return <TrialBanner banner={banner} />;
            default:
                return <GoLiveBanner banner={banner} />;
        }
    };

    return (
        <div className="flex flex-col gap-0 transition-all duration-500 ease-in-out">
            {renderBanner(currentBanner)}
        </div>
    );
};

export default DashboardBannerSystem;
