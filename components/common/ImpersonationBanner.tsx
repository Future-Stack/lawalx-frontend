'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/redux/store/hook';
import { setUser } from '@/redux/features/auth/authSlice';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

/**
 * ImpersonationBanner
 *
 * Shows a yellow banner at the top of the screen when an Admin/Supporter
 * has logged into a User's account via "Login as User".
 *
 * The original admin token is stored in sessionStorage under the key
 * 'impersonation_original_token'. When this key exists, the banner appears.
 *
 * Clicking "Return to Admin Panel" restores the admin's session.
 */
export default function ImpersonationBanner() {
  const dispatch = useAppDispatch();
  const [impersonatedUserEmail, setImpersonatedUserEmail] = useState<string | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    // Check if there is a saved admin token in sessionStorage
    const originalToken = sessionStorage.getItem('impersonation_original_token');
    if (!originalToken) {
      setIsImpersonating(false);
      return;
    }

    // We are currently impersonating — show the banner
    setIsImpersonating(true);

    // Try to show WHO we are impersonating (from the current user token in cookies)
    try {
      const currentToken = Cookies.get('token');
      if (currentToken) {
        const decoded: any = jwtDecode(currentToken);
        setImpersonatedUserEmail(decoded?.userEmail || decoded?.email || 'User');
      }
    } catch {
      setImpersonatedUserEmail('User');
    }
  }, []);

  const handleReturnToAdmin = () => {
    const originalToken = sessionStorage.getItem('impersonation_original_token');
    const originalRefreshToken = sessionStorage.getItem('impersonation_original_refresh_token');

    if (!originalToken) return;

    // 1. Restore admin tokens to cookies via Redux
    dispatch(
      setUser({
        token: originalToken,
        refreshToken: originalRefreshToken || '',
      })
    );

    // 2. Clean up sessionStorage
    sessionStorage.removeItem('impersonation_original_token');
    sessionStorage.removeItem('impersonation_original_refresh_token');

    // 3. Redirect back to Admin dashboard
    window.location.href = '/admin/dashboard';
  };

  // Nothing to show if not impersonating
  if (!isImpersonating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-amber-400 text-amber-900 flex items-center justify-between px-4 py-2 shadow-md text-sm font-medium">
      <div className="flex items-center gap-2">
        {/* Warning Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>
          You are currently impersonating{' '}
          <strong>{impersonatedUserEmail}</strong>. Any actions will be
          performed as this user.
        </span>
      </div>
      <button
        onClick={handleReturnToAdmin}
        className="ml-4 bg-amber-900 text-amber-50 px-3 py-1 rounded-md text-xs font-semibold hover:bg-amber-800 transition-colors cursor-pointer whitespace-nowrap"
      >
        Return to Admin Panel
      </button>
    </div>
  );
}
