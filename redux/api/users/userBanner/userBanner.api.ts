import { baseApi } from "../../baseApi";
import { GetBannersResponse } from "./userBanner.type";

const bannerAPI = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUserBannerData: build.query<GetBannersResponse, void>({
      query: () => ({
        url: "/banners/active",
        method: "GET",
      }),
      providesTags: ["Banner"],
    }),
  }),
});

export const { useGetUserBannerDataQuery } = bannerAPI;
