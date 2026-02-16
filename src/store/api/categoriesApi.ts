import { api } from './baseApi';

export const categoriesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query<any, void>({
            providesTags: ['Category'],
            query: () => 'categories',
        }),
        getCategoryById: builder.query<any, string>({
            providesTags: ['Category'],
            query: (id) => `categories/${id}`,
        }),
    }),
    overrideExisting: false,
});

export const { useGetCategoriesQuery, useGetCategoryByIdQuery } = categoriesApi;
