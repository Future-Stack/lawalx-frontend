'use client';

import { useGetSystemInfoQuery } from '@/redux/api/admin/profile&settings/adminSettingsApi';
import { Loader2, AlertCircle } from 'lucide-react';

export default function SystemSection() {
    const { data: systemInfoData, isLoading, isError } = useGetSystemInfoQuery(undefined);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-bgBlue" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-red-500 gap-2">
                <AlertCircle className="w-8 h-8" />
                <p className="font-medium">Failed to load system information</p>
            </div>
        );
    }

    const data = systemInfoData?.data;

    const sysInfo = [
        { label: 'Version', value: data?.version || '—' },
        { label: 'Last Updated', value: data?.lastUpdated || '—' },
        { label: 'Database', value: data?.database || '—' },
        { label: 'Server', value: data?.server || '—' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-navbarBg border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-border bg-[#F0FAFF] dark:bg-blue-900/10">
                    <h2 className="text-lg font-semibold text-headings">System Information</h2>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
                        {sysInfo.map((info, i) => (
                            <div key={i} className="space-y-2">
                                <p className="text-xs font-semibold text-muted uppercase tracking-wider">{info.label}</p>
                                <p className="text-md font-medium text-headings">{info.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
