import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const GoLiveBanner = () => {
    return (
        <div className="flex items-center justify-center md:justify-between mb-6 dashboard-header-bg p-6 rounded-xl relative overflow-hidden">
            <div className="ml-0 space-y-3.5 md:ml-0 lg:ml-10 z-10">
                <h1
                    className="text-[24px] md:text-[32px] font-semibold text-white leading-[160%] tracking-[-0.64px]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                >
                    Go Live on Any Screen Instantly
                </h1>
                <p
                    className="text-[14px] md:text-[16px] text-white/85 font-normal leading-[160%] tracking-[-0.32px]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                >
                    Create your first screen and start displaying your content in minutes.
                </p>
                <Link href="/choose-plan" className="inline-block">
                    <button
                        className="bg-bgBlue hover:bg-blue-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg flex items-center justify-center gap-1 text-sm md:text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out shadow-customShadow min-w-40 pt-2"
                    >
                        Upgrade <ArrowUpRight className="w-5 h-5" />
                    </button>
                </Link>
            </div>
            <div className="md:mr-2 lg:mr-4 xl:mr-10 md:block hidden z-10">
                <Image
                    src="/userDashboard/img3.webp"
                    alt="Dashboard Header"
                    height={165}
                    width={165}
                    style={{ transform: "scale(1.25)" }}
                />
            </div>
        </div>
    );
};

export default GoLiveBanner;
