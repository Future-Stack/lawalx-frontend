'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EditProfileForm from './EditProfileForm';
import ChangePasswordForm from './ChangePasswordForm';
import { useGetUserProfileQuery } from '@/redux/api/users/userProfileApi';
import { useUpdateSupporterProfileMutation } from '@/redux/api/supporter/supporterTicketApi';
import { toast } from 'sonner';

const getFullImageUrl = (path: string | null | undefined) => {
  if (!path) return 'profile';
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace('/api/v1', '');
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState('edit-profile');
  const { data: profileData } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUploading }] = useUpdateSupporterProfileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = profileData?.data;
  const userName = profile?.full_name || profile?.username || 'Supporter';
  const profileImg = getFullImageUrl(profile?.image_url);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    // If we only want to update photo, we might need to send the name too if backend requires it
    // But usually, multipart allows partial fields. 
    if (profile?.full_name) {
      formData.append('full_name', profile.full_name);
    }

    try {
      const res = await updateProfile(formData).unwrap();
      if (res.success) {
        toast.success('Profile photo updated');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload photo');
    }
  };

  return (
    <div className="w-full mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="relative mb-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-[3px] border-white shadow-sm bg-gray-100 dark:bg-gray-800">
            <img
              src={profileImg}
              alt="Profile Picture"
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
          </div>

          {/* Show camera button only in Edit Profile tab */}
          {activeTab === 'edit-profile' && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-[#1EA1F2] text-white rounded-full border-2 border-white cursor-pointer hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-50"
                aria-label="Upload picture"
              >
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {userName}
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8 sm:mb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-xl">
          <TabsList className="grid w-full grid-cols-2 h-15 sm:h-15 bg-white dark:bg-[#0c1427] border border-[#0FA6FF] dark:border-blue-900/50 rounded-xs p-1">
            <TabsTrigger
              value="edit-profile"
              className="rounded-xs border-none text-gray-600 dark:text-gray-400 data-[state=active]:bg-[#1EA1F2] data-[state=active]:text-white data-[state=active]:shadow-sm text-sm font-medium transition-all h-full"
            >
              Edit Profile
            </TabsTrigger>
            <TabsTrigger
              value="change-password"
              className="rounded-xs border-none text-gray-600 dark:text-gray-400 data-[state=active]:bg-[#1EA1F2] data-[state=active]:text-white data-[state=active]:shadow-sm text-sm font-medium transition-all h-full"
            >
              Change Password
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Contents */}
      <div className="w-full mx-auto p-2 sm:p-4 rounded-2xl">
        {activeTab === 'edit-profile' && <EditProfileForm />}
        {activeTab === 'change-password' && <ChangePasswordForm />}
      </div>
    </div>
  );
}
