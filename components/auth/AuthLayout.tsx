"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface AuthLayoutProps {
    children: React.ReactNode;
    imageSrc?: string;
    loading?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, imageSrc = "/images/authImage.png", loading = false }) => {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-navbarBg">
            {/* Left Side: Form Content */}
            <div className="flex flex-col w-full lg:w-1/2 p-6 sm:p-8 lg:p-12">
                {/* Logo */}
                <div className="mb-8 lg:mb-12">
                    <Link href="/" className="inline-block">
                        <Image
                            src="/tape.png"
                            alt="Tape logo"
                            width={120}
                            height={40}
                            priority
                            className="h-10 w-auto"
                        />
                    </Link>
                </div>

                {/* Form Content - Centered */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 lg:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
                    <p>© 2025 Tape. All Rights Reserved</p>
                    <button className="px-6 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200 text-black shadow-customShadow font-medium cursor-pointer">
                        Contact Us
                    </button>
                </div>
            </div>

            {/* Right Side: Featured Image */}
            <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center relative overflow-hidden bg-navbarBg p-8">
                <div className="relative z-10 w-full max-w-2xl h-full flex items-center justify-center">
                    {loading ? (
                        <div className="w-full aspect-square flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-6 h-6 border-2 border-bgBlue border-t-transparent rounded-full animate-spin"></div>
                                {/* <span className="text-sm text-muted-foreground font-medium">Image Loading ...</span> */}
                            </div>
                        </div>
                    ) : (
                        <Image
                            src={imageSrc}
                            alt="Featured mockup"
                            width={1000}
                            height={1000}
                            className="w-full h-full object-cover drop-shadow-2xl rounded-[24px] animate-in fade-in zoom-in duration-500"
                            priority
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;