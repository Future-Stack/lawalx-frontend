'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChangePasswordForm() {
  return (
    <div className="animate-in fade-in duration-300">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6">
        Change Your Password
      </h3>
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Old Password
          </label>
          <Input
            type="password"
            placeholder="••••••••••••"
            className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus-visible:ring-1 focus-visible:ring-[#1EA1F2] h-11"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
            New Password
          </label>
          <Input
            type="password"
            placeholder="••••••••••••"
            className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus-visible:ring-1 focus-visible:ring-[#1EA1F2] h-11"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Confirm Password
          </label>
          <Input
            type="password"
            placeholder="••••••••••••"
            className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus-visible:ring-1 focus-visible:ring-[#1EA1F2] h-11"
          />
        </div>
        <div className="pt-4">
          <Button className="w-full bg-[#1EA1F2] hover:bg-[#198CD6] text-white font-medium h-11 rounded-lg transition-colors">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
