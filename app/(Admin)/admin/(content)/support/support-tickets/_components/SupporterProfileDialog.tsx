'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Mail, Shield, Zap, Calendar, Clock, Briefcase, User } from 'lucide-react';
import { useGetEmployeeByIdQuery } from '@/redux/api/admin/support/adminSupporterApi';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface SupporterProfileDialogProps {
  supporterId: string | null;
  open: boolean;
  onClose: () => void;
}

export default function SupporterProfileDialog({
  supporterId,
  open,
  onClose,
}: SupporterProfileDialogProps) {
  const { data: response, isLoading, isError } = useGetEmployeeByIdQuery(supporterId ?? '', {
    skip: !supporterId || !open,
  });

  const supporter = response?.data;

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) return; }}>
      <DialogContent
        className="sm:max-w-[500px] p-0 bg-white dark:bg-gray-900 border-none shadow-xl overflow-hidden [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
            Supporter Profile
          </DialogTitle>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6 overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
          {isLoading ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full text-gray-500 bg-gray-200 dark:bg-gray-800" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40 bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 rounded-xl bg-gray-200 dark:bg-gray-800" />
                <Skeleton className="h-24 rounded-xl bg-gray-200 dark:bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-800" />
                <Skeleton className="h-20 rounded-xl bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          ) : isError ? (
            <div className="py-10 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 text-sm">
              Failed to load supporter profile. Please try again later.
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header: Avatar + Info */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800 overflow-hidden">
                    {supporter?.user?.image_url ? (
                      <img src={(process.env.NEXT_PUBLIC_BASE_URL || '').replace('/api/v1', '') +supporter.user.image_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {supporter?.user?.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900",
                    supporter?.user?.isOnline ? "bg-green-500" : "bg-gray-400"
                  )} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                    {supporter?.user?.full_name || supporter?.user?.username}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {supporter?.user?.account?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                      supporter?.workload && supporter.workload >= 4
                        ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                        : "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    )}>
                      {supporter?.workload && supporter.workload >= 4 ? 'Busy' : 'Available'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="flex items-center gap-2 mb-1.5 text-gray-500 dark:text-gray-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Current Workload</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {supporter?.workload ?? 0}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="flex items-center gap-2 mb-1.5 text-gray-500 dark:text-gray-400">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Work Items</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {supporter?.workItems?.length ?? 0}
                  </div>
                </div>
              </div>

              {/* Roles & Skills */}
              <div className="space-y-5">
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    Role & Designations
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {supporter?.supporterRole?.map((role) => (
                      <span key={role} className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-100 dark:border-blue-800">
                        {role.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    Technical Skills
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {supporter?.skills?.map((skill) => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-200 dark:border-gray-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="pt-5 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">Joined</p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {supporter?.createdAt ? new Date(supporter.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">Last Seen</p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {supporter?.user?.lastOnlineAt ? new Date(supporter.user.lastOnlineAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <Button
            onClick={onClose}
            className="h-9 px-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-xs font-bold"
          >
            Close Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("block", className)}>
      {children}
    </span>
  );
}
