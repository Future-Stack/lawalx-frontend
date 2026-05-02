import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { Banner } from "@/redux/api/users/userBanner/userBanner.type";

interface TrialBannerProps {
    banner?: Banner;
}

const TrialBanner = ({ banner }: TrialBannerProps) => {
    const PrimaryIcon = banner?.primaryButtonIcon ? (Icons as unknown as Record<string, LucideIcon>)[banner.primaryButtonIcon] : ArrowUpRight;

    return (
        <div
            className="mb-6 flex flex-col md:flex-row items-center justify-between p-6 rounded-xl border gap-4"
            style={{
                padding: '24px',
                border: '1px solid var(--Border, #D4D4D4)',
                background: 'linear-gradient(270deg, rgba(34, 197, 94, 0.00) 0%, rgba(34, 197, 94, 0.10) 98.77%), var(--Card-Background, #FAFAFA)',
                borderRadius: '12px',
                alignSelf: 'stretch',
            }}
        >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <div className="flex-shrink-0 bg-white p-1 rounded-lg border border-[#D4D4D4]">
                    <span className="text-xl flex items-center justify-center" style={{ width: '28px', height: '28px' }}>👑</span>
                </div>
                <div className="text-center md:text-left">
                    <h3
                        className="mb-1"
                        style={{
                            color: 'var(--Headings, #171717)',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '24px',
                            fontWeight: 600,
                            lineHeight: 'normal'
                        }}
                    >
                        {banner?.title || "Trial ends in 12 days!"}
                    </h3>
                    <p
                        style={{
                            color: 'var(--Body-Texts, #404040)',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '16px',
                            fontWeight: 400,
                            lineHeight: '24px'
                        }}
                    >
                        {banner?.description || "Upgrade to Premium for more features."}
                    </p>
                </div>
            </div>
            <Link href={banner?.primaryButtonUrl || "/choose-plan"} className="w-full md:w-auto">
                <button
                    className="w-full md:w-auto text-white transition-colors flex items-center justify-center cursor-pointer"
                    style={{
                        display: 'flex',
                        padding: '12px 12px 12px 16px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '6px',
                        borderRadius: '10px',
                        background: 'var(--Secondary-Action, #111827)',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                    }}
                >
                    {banner?.primaryButtonLabel || "Upgrade"} {PrimaryIcon && <PrimaryIcon className="w-4 h-4" />}
                </button>
            </Link>
        </div>
    );
};

export default TrialBanner;
