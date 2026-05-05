"use client";

import UserDashboardNavbar from "@/components/layout/UserDashboardNavbar";
import SidebarComponent from "@/components/sidebar/SidebarComponent";
import { FileUp, LayoutTemplate } from 'lucide-react';
import { useState, useEffect } from "react";
import Wrapper from "@/components/layout/Wrapper";

const contentSidebarItems = [
    {
        icon: <FileUp className="w-5 h-5" />,
        label: 'Uploaded Files',
        href: '/content',
    },
    {
        icon: <LayoutTemplate className="w-5 h-5" />,
        label: 'Template',
        href: '/content/template',
    },
];

export default function ContentGroupLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setIsMobile(true);
                setIsCollapsed(true);
            } else if (width < 1024) {
                setIsMobile(false);
                setIsCollapsed(true);
            } else {
                setIsMobile(false);
                if (width >= 1024) setIsCollapsed(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-White">
            <UserDashboardNavbar />

            <div className="flex">
                {!isMobile && (
                    <SidebarComponent items={contentSidebarItems} isCollapsed={isCollapsed} className="top-20 sm:top-24" />
                )}

                <main
                    className={`flex-1 min-h-screen transition-all duration-300 ${isMobile ? 'ml-0' : (isCollapsed ? 'ml-16' : 'ml-64')}`}
                >
                    <Wrapper fullWidth={isCollapsed}>{children}</Wrapper>
                </main>
            </div>
        </div>
    );
}
