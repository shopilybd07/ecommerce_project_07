import { api } from './baseApi';

export const subcategoriesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getSubcategories: builder.query<any, string | undefined>({
            providesTags: ['Subcategory'],
            query: (categoryId) => `subcategories${categoryId ? `?categoryId=${categoryId}` : ''}`,
        }),
        getSubcategoryById: builder.query<any, string>({
            providesTags: ['Subcategory'],
            query: (id) => `subcategories/${id}`,
        }),
    }),
    overrideExisting: false,
});

export const { useGetSubcategoriesQuery, useGetSubcategoryByIdQuery } = subcategoriesApi;
