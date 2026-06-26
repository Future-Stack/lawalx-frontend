import React from "react";
import { Users, UserCheck } from "lucide-react";

interface UserStatsCardsProps {
  stats: {
    totalUsers?: {
      count: number;
      change: number;
    };
    activeUsers?: {
      count: number;
      change: number;
    };
  };
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div className="bg-navbarBg p-4 rounded-lg border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total Users
          </span>
        </div>
        <div className="text-3xl font-semibold text-gray-900 dark:text-white">
          {stats.totalUsers?.count || 0}
        </div>
        <div className={`text-sm ${(stats.totalUsers?.change || 0) < 0 ? 'text-red-500' : 'text-green-500'} flex items-center gap-1 mt-1`}>
          <span>{(stats.totalUsers?.change || 0) < 0 ? '↓' : '↑'} {Math.abs(stats.totalUsers?.change || 0)} %</span>
          <span className="text-gray-500 dark:text-gray-400">
            From Last Month
          </span>
        </div>
      </div>

      <div className="bg-navbarBg p-4 rounded-lg border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Active Users
          </span>
        </div>
        <div className="text-3xl font-semibold text-gray-900 dark:text-white">
          {stats.activeUsers?.count || 0}
        </div>
        <div className={`text-sm ${(stats.activeUsers?.change || 0) < 0 ? 'text-red-500' : 'text-green-500'} flex items-center gap-1 mt-1`}>
          <span>{(stats.activeUsers?.change || 0) < 0 ? '↓' : '↑'} {Math.abs(stats.activeUsers?.change || 0)} %</span>
          <span className="text-gray-500 dark:text-gray-400">
            From Last Month
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserStatsCards;
