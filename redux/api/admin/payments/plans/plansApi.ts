import { baseApi } from "../../../baseApi";

// Types
export interface PlanItem {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  deviceLimit: number;
  storageLimitGb: number;
  fileLimit: number;
  fileSizeLimitMb: number;
  isAdvanceEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export type GetPlansResponse = ApiResponse<PlanItem[]>;
export type GetSinglePlanResponse = ApiResponse<PlanItem>;
export type UpdatePlanResponse = ApiResponse<PlanItem>;

export interface UpdatePlanPayload {
  description?: string;
  price?: number;
  currency?: string;
  deviceLimit?: number;
  storageLimitGb?: number;
  fileLimit?: number;
  fileSizeLimitMb?: number;
  isAdvanceEnabled?: boolean;
  isActive?: boolean;
}

// API
export const plansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<GetPlansResponse, void>({
      query: () => ({
        url: `/plans`,
        method: "GET",
      }),
      providesTags: ["Subscription"],
    }),
    getSinglePlan: builder.query<GetSinglePlanResponse, string>({
      query: (id) => ({
        url: `/plans/${id}`,
        method: "GET",
      }),
      providesTags: ["Subscription"],
    }),
    updatePlan: builder.mutation<UpdatePlanResponse, { id: string; data: UpdatePlanPayload }>({
      query: ({ id, data }) => ({
        url: `/plans/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useLazyGetPlansQuery,
  useGetSinglePlanQuery,
  useLazyGetSinglePlanQuery,
  useUpdatePlanMutation,
} = plansApi;
