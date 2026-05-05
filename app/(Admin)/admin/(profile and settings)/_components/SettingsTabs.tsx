'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Palette, ShieldCheck, UserCog, Settings } from 'lucide-react';

const tabs = [
    {
        icon: User,
        label: 'Profile',
        href: '/admin/profile-settings/profile',
    },
    {
        icon: Palette,
        label: 'Preferences',
        href: '/admin/profile-settings/preferences',
    },
    {
        icon: ShieldCheck,
        label: 'Passwords Security',
        href: '/admin/profile-settings/password-security',
    },
    {
        icon: UserCog,
        label: 'Users & Roles',
        href: '/admin/profile-settings/users-roles',
    },
    {
        icon: Settings,
        label: 'System',
        href: '/admin/profile-settings/system',
    },
];

export default function SettingsTabs() {
    const pathname = usePathname();

    return (
        <div className="w-full mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 border border-border rounded-full p-2 bg-navbarBg w-max min-w-full">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                                isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 border border-blue-200 dark:border-blue-800 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : ''}`} />
                            {tab.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
