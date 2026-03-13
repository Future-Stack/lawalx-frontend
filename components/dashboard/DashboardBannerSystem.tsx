"use client";

import GoLiveBanner from "./banners/GoLiveBanner";
import DownloadAppBanner from "./banners/DownloadAppBanner";
import TrialBanner from "./banners/TrialBanner";

const DashboardBannerSystem = () => {
    return (
        <div className="flex flex-col gap-0">
            <TrialBanner />
            <DownloadAppBanner />
            <GoLiveBanner />
        </div>
    );
};

export default DashboardBannerSystem;
