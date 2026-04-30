'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChangePasswordMutation } from '@/redux/api/users/authApi';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    try {
      const res = await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      }).unwrap();

      if (res.success) {
        toast.success(res.message || 'Password changed successfully!');
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to change password');
    }
  };

  const toggleVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="animate-in fade-in duration-300">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6">
        Change Your Password
      </h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Old Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Old Password
          </label>
          <div className="relative">
            <Input
              type={showPasswords.old ? 'text' : 'password'}
              placeholder="••••••"
              required
              value={formData.oldPassword}
              onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
              className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus-visible:ring-1 focus-visible:ring-[#1EA1F2] h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => toggleVisibility('old')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
            New Password
          </label>
          <div className="relative">
            <Input
              type={showPasswords.new ? 'text' : 'password'}
              placeholder="••••••"
              required
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus-visible:ring-1 focus-visible:ring-[#1EA1F2] h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => toggleVisibility('new')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              type={showPasswords.confirm ? 'text' : 'password'}
              placeholder="••••••"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus-visible:ring-1 focus-visible:ring-[#1EA1F2] h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => toggleVisibility('confirm')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#1EA1F2] hover:bg-[#198CD6] text-white font-medium h-11 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Updating...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
