import { baseApi } from "../../baseApi";
import type {
  ActivePlansParams,
  ActiveScreenSize,
  PlanApiResponse,
  PlanByIdParams,
  UserPlan,
} from "./plan.type";

export const userPlanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivePlans: builder.query<PlanApiResponse<UserPlan[]>, ActivePlansParams>({
      query: ({ billing, screenSize }) => ({
        url: "/plans/active",
        method: "GET",
        params: { billing, screenSize },
      }),
      providesTags: ["UserPlans"],
    }),
    getPlanById: builder.query<PlanApiResponse<UserPlan>, PlanByIdParams>({
      query: ({ id, billing, screenSize }) => ({
        url: `/plans/${id}`,
        method: "GET",
        params: { billing, screenSize },
      }),
      providesTags: (_result, _error, { id }) => [{ type: "UserPlans", id }],
    }),
    getActiveScreenSizes: builder.query<
      PlanApiResponse<ActiveScreenSize[]>,
      void
    >({
      query: () => ({
        url: "/subscription-management/screen-size/active",
        method: "GET",
      }),
      providesTags: ["UserPlans"],
    }),
  }),
});

export const {
  useGetActivePlansQuery,
  useGetPlanByIdQuery,
  useGetActiveScreenSizesQuery,
} = userPlanApi;
