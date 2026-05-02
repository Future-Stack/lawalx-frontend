import { baseApi } from '../baseApi';

export const faqTutorialApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // FAQ Endpoints
        getAllFaqs: builder.query({
            query: (params) => ({
                url: '/faq/all',
                method: 'GET',
                params: params,
            }),
            providesTags: ['FAQ'],
        }),
        incrementFaqView: builder.mutation({
            query: (id) => ({
                url: `/faq/${id}/view`,
                method: 'POST',
            }),
            invalidatesTags: ['FAQ'],
        }),

        // Video FAQ Endpoints
        getAllVideoFaqs: builder.query({
            query: (params) => ({
                url: '/video-faq/all',
                method: 'GET',
                params: params,
            }),
            providesTags: ['VideoFAQ'],
        }),
        incrementVideoView: builder.mutation({
            query: (id) => ({
                url: `/video-faq/${id}/view`,
                method: 'POST',
            }),
            invalidatesTags: ['VideoFAQ'],
        }),
    }),
});

export const {
    useGetAllFaqsQuery,
    useIncrementFaqViewMutation,
    useGetAllVideoFaqsQuery,
    useIncrementVideoViewMutation,
} = faqTutorialApi;
