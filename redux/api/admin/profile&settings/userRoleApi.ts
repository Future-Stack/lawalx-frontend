import { baseApi } from "../../baseApi";

const userRoleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllEmployees: builder.query({
      query: (filterFullWorkload) => ({
        url: `/admin/support/all-employees${filterFullWorkload !== undefined ? `?filterFullWorkload=${filterFullWorkload}` : ""}`,
        method: "GET",
      }),
      providesTags: ["AdminSettings"],
    }),
    createEmployee: builder.mutation({
      query: (data) => ({
        url: "/admin/support/create-employees",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AdminSettings"],
    }),
  }),
});

export const { useGetAllEmployeesQuery, useCreateEmployeeMutation } = userRoleApi;
