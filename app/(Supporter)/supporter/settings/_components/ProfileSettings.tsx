'use client';

import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EditProfileForm from './EditProfileForm';
import ChangePasswordForm from './ChangePasswordForm';

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState('edit-profile');

  return (
    <div className="w-full mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="relative mb-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-[3px] border-white shadow-sm bg-gray-100">
            {/* Replace with real user profile image */}
            <img
              src="https://avatar.iran.liara.run/public"
              alt="Profile Picture"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-[#1EA1F2] text-white rounded-full border-2 border-white cursor-pointer hover:bg-blue-500 transition-colors shadow-sm"
            aria-label="Upload picture"
          >
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Jane Cooper
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8 sm:mb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-xl">
          <TabsList className="grid w-full grid-cols-2 h-15 sm:h-15 bg-white border border-[#0FA6FF] rounded-xs">
            <TabsTrigger
              value="edit-profile"
              className="rounded-xs border-none data-[state=active]:bg-[#1EA1F2] data-[state=active]:text-white data-[state=active]:shadow-sm text-sm font-medium transition-all"
            >
              Edit Profile
            </TabsTrigger>
            <TabsTrigger
              value="change-password"
              className="rounded-xs border-none data-[state=active]:bg-[#1EA1F2] data-[state=active]:text-white data-[state=active]:shadow-sm text-sm font-medium transition-all"
            >
              Change Password
            </TabsTrigger>

          </TabsList>
        </Tabs>
      </div>

      {/* Tab Contents */}
      <div className="w-full mx-auto p-6 sm:p-8 rounded-2xl">
        {activeTab === 'edit-profile' && <EditProfileForm />}
        {activeTab === 'change-password' && <ChangePasswordForm />}
      </div>
    </div>
  );
}
