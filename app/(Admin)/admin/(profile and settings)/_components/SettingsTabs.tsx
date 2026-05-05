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
            <div className="rounded-full border border-border p-1 inline-flex mb-6 shrink-0 w-max bg-navbarBg gap-2">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                                isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-customShadow'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
