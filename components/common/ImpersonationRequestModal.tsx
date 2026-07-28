'use client';

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { getNotificationSocket } from '@/lib/notificationSocket';
import { useGetMyPendingRequestsQuery, useRespondToImpersonateRequestMutation } from '@/redux/api/users/impersonationApi';
import { toast } from 'sonner';

export default function ImpersonationRequestModal() {
  const [activeRequest, setActiveRequest] = useState<any>(null);
  
  // Use RTK query to get pending requests on load
  const { data: requestsResponse, refetch } = useGetMyPendingRequestsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [respondToRequest, { isLoading }] = useRespondToImpersonateRequestMutation();

  useEffect(() => {
    if (requestsResponse?.data && requestsResponse.data.length > 0) {
      const first = requestsResponse.data[0];
      setActiveRequest({
        requestId: first.id,
        requesterName: first.requester?.full_name || first.requester?.username,
        requesterRole: first.requester?.role,
        reason: first.reason,
      });
    }
  }, [requestsResponse]);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) return;

    // Use the singleton socket
    const socket = getNotificationSocket(token);

    const handleNotification = (data: any) => {
      if (data.notificationStatus === 'impersonate_request' && data.metadata) {
        setActiveRequest(data.metadata);
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, []);

  if (!activeRequest) return null;

  const handleResponse = async (status: 'APPROVED' | 'REJECTED') => {
    try {
      await respondToRequest({ requestId: activeRequest.requestId, status }).unwrap();
      setActiveRequest(null);
      refetch();
      if (status === 'APPROVED') {
        toast.success('Access request approved');
      } else {
        toast.info('Access request denied');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send response');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-lg font-semibold mb-1">Admin Access Request</h3>
        <p className="text-sm text-slate-300 mb-4">
          <span className="font-bold text-amber-400">{activeRequest.requesterName}</span> ({activeRequest.requesterRole}) requests permission to log into your account.
        </p>
        {activeRequest.reason && (
          <p className="text-xs bg-slate-800/80 p-3 rounded-lg text-slate-400 italic mb-6">
            "{activeRequest.reason}"
          </p>
        )}
        <div className="flex space-x-3">
          <button
            onClick={() => handleResponse('REJECTED')}
            disabled={isLoading}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Deny
          </button>
          <button
            onClick={() => handleResponse('APPROVED')}
            disabled={isLoading}
            className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Allow Access
          </button>
        </div>
      </div>
    </div>
  );
}
