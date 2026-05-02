import Image from "next/image";
import { Banner } from "@/redux/api/users/userBanner/userBanner.type";

interface DownloadAppBannerProps {
    banner?: Banner;
}

const DownloadAppBanner = ({ banner }: DownloadAppBannerProps) => {
    const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const imageBaseUrl = envBaseUrl.replace(/\/api\/v1\/?$/, "");
    const fullImageUrl = banner?.mediaUrl 
        ? (banner.mediaUrl.startsWith("http") ? banner.mediaUrl : `${imageBaseUrl}/${banner.mediaUrl.startsWith("/") ? banner.mediaUrl.slice(1) : banner.mediaUrl}`)
        : "/addLogo/add-right.png";

    return (
        <div
            className="relative mb-6 flex flex-col md:flex-row items-center justify-between overflow-hidden p-2 rounded-[20px] border border-borderGray bg-[linear-gradient(180deg,rgba(15,166,255,0.10)-7.42%,rgba(236,151,207,0.10)100%)] bg-white"
        >
            {/* Left Content */}
            <div className="flex-1 p-6 md:p-10">
                <h2 className="mb-2 text-Heading font-inter text-2xl font-semibold leading-normal">
                    {banner?.title || "Download Our Mobile App"}
                </h2>
                <p className="mb-8 max-w-[500px] text-navGray font-inter text-sm font-normal leading-5">
                    {banner?.description || "This blog post has been published. Team members will be able to edit and publish the changes."}
                </p>

                <div className="flex flex-wrap gap-4">
                    <a href="#" className="hover:opacity-80 transition-opacity">
                        <Image
                            src="/addLogo/app-store.png"
                            alt="Download on the App Store"
                            width={120}
                            height={40}
                            className="h-10 w-[119.664px]"
                        />
                    </a>
                    <a href="#" className="hover:opacity-80 transition-opacity">
                        <Image
                            src="/addLogo/google-play.png"
                            alt="Get it on Google Play"
                            width={120}
                            height={40}
                            className="h-10 w-[119.664px]"
                        />
                    </a>
                </div>
            </div>

            {/* Right Image */}
            <div className="relative w-full md:w-auto mt-4 md:mt-0 px-6 md:px-0">
                <div className="rounded-xl overflow-hidden md:mr-4 mb-4 md:mb-0">
                    <Image
                        src={fullImageUrl}
                        alt={banner?.title || "Mobile App Mockup"}
                        width={300}
                        height={200}
                        className="object-cover rounded-xl w-[300px] h-[250px]"
                        unoptimized={!!banner?.mediaUrl}
                    />
                </div>
            </div>
        </div>
    );
};

export default DownloadAppBanner;
