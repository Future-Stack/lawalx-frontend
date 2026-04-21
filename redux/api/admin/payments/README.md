# Admin Payments API Integration Pattern

This document outlines the pattern used for integrating subscription-related APIs in the admin panel.

## Folder Structure

```
redux/api/admin/payments/
├── README.md (this file)
├── subscribersApi.ts (types + API)
├── plans/
│   └── plansApi.ts (types + API)
├── discount/
│   └── discountApi.ts (types + API)
├── billingsApi.ts (next)
└── couponsApi.ts (future)
```

## File Naming Convention

- **API Files**: `<feature>Api.ts` (e.g., `subscribersApi.ts`)
- **All types are included in the same file**

## Pattern to Follow

### 1. Create API File (`*Api.ts`) with Types Included

```typescript
import { baseApi } from "../../baseApi";

// Types
export interface SubscriberItem {
  userId: string;
  userName: string;
  email: string;
  // ... other fields
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export type GetSubscribersResponse = ApiResponse<SubscriberItem[]>;

export interface GetSubscribersParams {
  page?: number;
  limit?: number;
  search?: string;
  plan?: string;
}

// API
export const subscribersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscribers: builder.query<GetSubscribersResponse, GetSubscribersParams>({
      query: (params) => ({
        url: `/subscribers`,
        method: "GET",
        params,
      }),
      providesTags: ["Subscription"],
    }),
  }),
});

export const { useGetSubscribersQuery, useLazyGetSubscribersQuery } = subscribersApi;
```

### 2. Component Integration

```typescript
import { useGetSubscribersQuery } from "@/redux/api/admin/payments/subscribersApi";

const Component = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { data, isLoading, isError } = useGetSubscribersQuery({
    page,
    limit,
    search: searchTerm || undefined,
  });

  const items = data?.data || [];
  const meta = data?.meta;

  // Handle loading, error, empty states
  if (isLoading) return <Loader />;
  if (isError) return <Error />;
  if (items.length === 0) return <Empty />;

  return (
    // Render items
  );
};
```

## Key Points to Remember

1. **Base URL**: Already configured in `baseApi.ts` as `process.env.NEXT_PUBLIC_BASE_URL`
2. **Auth**: Automatically handled via `authorization` header from Redux state
3. **Token Refresh**: Auto-refresh on 401 (already in `baseApi.ts`)
4. **Tags**: Use `providesTags: ["Subscription"]` for cache invalidation
5. **Response Structure**: Always `{ statusCode, success, message, data, meta? }`
6. **Pagination**: Use `page`, `limit`, and `meta` from response
7. **Loading States**: Handle `isLoading`, `isError`, and empty data
8. **Search/Filter**: Reset page to 1 when filters change

## Completed Integrations

- ✅ **Subscribers API** (`GET /api/v1/subscribers`)
  - File: `subscribersApi.ts` (types + API in single file)
  - Component: `SubscribersTab.tsx`
  - Features: Search, filter by plan, pagination
  - Additional: `GET /api/v1/subscribers/{userId}/invoices` for viewing invoices

- ✅ **Plans API** (`GET /api/v1/plans`, `GET /api/v1/plans/{id}`, `PATCH /api/v1/plans/{id}`)
  - File: `plans/plansApi.ts` (types + API in single file)
  - Component: `PlansTab.tsx`, `CreatePlanDialog.tsx`
  - Features: 
    - List all plans with loading/error states
    - Edit plan with mutation
    - Dynamic data display (devices, storage, file limits)
    - Templates field kept static (backend doesn't provide it)
    - Advanced mode toggle for limits

- ✅ **Yearly Discount API** (`GET /api/v1/yearly-discount`, `GET /api/v1/yearly-discount/{id}`, `PATCH /api/v1/yearly-discount/{id}`, `PATCH /api/v1/yearly-discount/{id}/status`)
  - File: `discount/discountApi.ts` (types + API in single file)
  - Component: `PlansTab.tsx` (Yearly Discount section)
  - Features:
    - Fetch discount configuration on load
    - Toggle discount status (enable/disable) with switch button
    - Update discount rate with input field
    - Save button with loading state
    - Success/error toast notifications
    - Auto-sync discount state from API

## Next Steps

- ⏳ Billings API integration
- ⏳ Coupons API integration
