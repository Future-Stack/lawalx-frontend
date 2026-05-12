/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import { logout, setToken } from "../features/auth/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.token;
    console.log('Auth token:', token ? 'present' : 'missing');
    if (token) {
      headers.set("authorization", token);
    }
    // Ngrok warning bypass for development
    headers.set("ngrok-skip-browser-warning", "true");

    const currency = (getState() as any).settings.currency;
    if (currency) {
      headers.set("X-Display-Currency", currency);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    
    // Log errors for debugging
    if (result.error) {
      console.log('API Error result:', result);
    }

    const errorStatus = result?.error?.status || (result?.error as any)?.data?.statusCode;
    
    if (errorStatus === 401 || errorStatus === 403 || errorStatus === '401' || errorStatus === '403') {
      console.log('Detected session expiration/unauthorized status:', errorStatus);
      const refreshToken = (api.getState() as any).auth.refreshToken;

      if (refreshToken && errorStatus == 401) {
        console.log('Attempting token refresh...');
        const refreshResult = await baseQuery(
          {
            url: "/auth/refresh-token",
            method: "POST",
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult?.data) {
          console.log('Token refresh successful');
          const newToken = (refreshResult.data as any).data?.accessToken;
          
          if (newToken) {
            api.dispatch(setToken({ token: newToken }));
            // Retry the original query with the new token
            result = await baseQuery(args, api, extraOptions);
            
            // Check if retry is successful. If it's still 401/403, we fall through to logout.
            const retryStatus = result?.error?.status || (result?.error as any)?.data?.statusCode;
            if (retryStatus !== 401 && retryStatus !== 403 && retryStatus !== '401' && retryStatus !== '403') {
              console.log('Retry successful, returning result');
              return result;
            }
            console.log('Retry failed with unauthorized status, proceeding to logout');
          } else {
            console.log('Refresh response missing accessToken');
          }
        } else {
          console.log('Refresh token expired or invalid:', refreshResult?.error);
          // Falls through to logout logic below
        }
      }

      // Final Cleanup: If no refresh token, or refresh failed, or it's a 403, or retry failed
      console.log('Final session invalidation: logging out and cleaning up all tokens');
      api.dispatch(logout());
      
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const isLoginPage = pathname.includes('/login') || pathname.includes('/signin');
        
        console.log('Current pathname:', pathname, 'Is login page:', isLoginPage);
        
        if (!isLoginPage) {
          let redirectPath = '/signin';
          if (pathname.startsWith('/admin')) {
            redirectPath = '/admin/login';
          } else if (pathname.startsWith('/supporter')) {
            redirectPath = '/supporter/login';
          }
          
          console.log('Redirecting to:', redirectPath);
          window.location.href = redirectPath;
        }
      }
    }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: ["User", "NotificationPermission", "Notification", "Activity", "Content", "Devices", "Programs", "Schedules", "Device", "AdminSettings", "Subscription", "ReportHub", "ReportHistory", "Banner", "Billing", "SupportTicket", "AdminSupportTicket", "AdminEmployee", "AdminSupporter", "SupporterTicket", "SupporterTicketStats", "FAQ", "VideoFAQ", "Preferences", "FinancialData"],
});
