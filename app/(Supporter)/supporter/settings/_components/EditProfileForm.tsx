'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function EditProfileForm() {
  return (
    <div className="animate-in fade-in duration-300">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6">
        Edit Your Profile
      </h3>
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Full Name
          </label>
          <Input
            type="text"
            placeholder="Bessie"
            defaultValue="Bessie"
            className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus-visible:ring-1 focus-visible:ring-[#1EA1F2] h-11"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Email
          </label>
          <Input
            type="email"
            placeholder="mobileip@mac.com"
            defaultValue="mobileip@mac.com"
            readOnly
            className="bg-[#F4F7F9] dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed focus-visible:ring-0 h-11"
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
