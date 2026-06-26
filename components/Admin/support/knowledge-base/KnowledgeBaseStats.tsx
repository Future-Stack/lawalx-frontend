import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, LucideIcon } from 'lucide-react';

interface StatItem {
    label: string;
    value: number | string;
    subtext: string;
    icon: LucideIcon;
    trend: string;
}

interface KnowledgeBaseStatsProps {
    stats: StatItem[];
}

export const KnowledgeBaseStats: React.FC<KnowledgeBaseStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-navbarBg border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={cn("p-2 rounded-lg border",
                            stat.icon === AlertTriangle ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30" : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                        )}>
                            <stat.icon className={cn("w-5 h-5", stat.icon === AlertTriangle ? "text-red-500" : "text-gray-600 dark:text-gray-400")} />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</span>
                    </div>
                    <div className={cn("text-3xl font-bold mb-1", stat.icon === AlertTriangle ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white")}>{stat.value}</div>
                    <div className="flex items-center gap-1">
                        <span className={cn("text-xs font-medium",
                            stat.trend === 'up' ? "text-green-500" :
                                stat.trend === 'down' ? "text-red-500" : "text-gray-500"
                        )}>
                            {stat.trend === 'up' ? '↗' : stat.trend === 'down' ? '↘' : ''}
                        </span>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{stat.subtext}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KnowledgeBaseStats;
