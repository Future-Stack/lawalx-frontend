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
    getEmployeeById: builder.query({
      query: (id) => ({
        url: `/admin/support/employee/${id}`,
        method: "GET",
      }),
      providesTags: ["AdminSettings"],
    }),
    updateEmployee: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/support/employee/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AdminSettings"],
    }),
  }),
});

export const { 
  useGetAllEmployeesQuery, 
  useCreateEmployeeMutation, 
  useGetEmployeeByIdQuery, 
  useUpdateEmployeeMutation 
} = userRoleApi;
