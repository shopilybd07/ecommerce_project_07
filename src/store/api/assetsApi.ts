import { api, ApiResponse } from './baseApi';

export const assetsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAssets: builder.query<any[], void>({
            providesTags: ['Asset'],
            query: () => 'assets/banners',
            transformResponse: (response: ApiResponse<any[]> | { success: boolean; assets: any[] }) => {
                if ('data' in response) {
                    return response.data;
                }
                return response.assets || [];
            },
        }),
    }),
    overrideExisting: false,
});

export const { useGetAssetsQuery } = assetsApi;
