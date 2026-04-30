'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGetUserProfileQuery } from '@/redux/api/users/userProfileApi';
import { useUpdateSupporterProfileMutation } from '@/redux/api/supporter/supporterTicketApi';
import { toast } from 'sonner';

export default function EditProfileForm() {
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateSupporterProfileMutation();
  
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (profileData?.success && profileData?.data) {
      setFullName(profileData.data.full_name || '');
    }
  }, [profileData]);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('full_name', fullName);

      const res = await updateProfile(formData).unwrap();
      if (res.success) {
        toast.success(res.message || 'Profile updated successfully');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-[#1EA1F2]" />
        <p className="text-sm text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  const profile = profileData?.data;

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
            placeholder="Your Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus-visible:ring-1 focus-visible:ring-[#1EA1F2] h-11"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Username
          </label>
          <Input
            type="text"
            value={profile?.username || ''}
            readOnly
            className="bg-[#F4F7F9] dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed focus-visible:ring-0 h-11"
          />
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSave}
            disabled={isUpdating}
            className="w-full bg-[#1EA1F2] hover:bg-[#198CD6] text-white font-medium h-11 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUpdating ? 'Updating Profile...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
