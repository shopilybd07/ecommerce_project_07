import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: ({ filters, pagination }) => ({
                url: 'products',
                params: { ...filters, ...pagination },
            }),
        }),
        getProductById: builder.query({
            query: (id) => `products/${id}`,
        }),
        searchProducts: builder.query({
            query: ({ query, filters, pagination }) => ({
                url: 'products/search',
                params: { q: query, ...filters, ...pagination },
            }),
        }),
        getCategories: builder.query<any, void>({
            query: () => 'categories',
        }),
        getCategoryById: builder.query<any, string>({
            query: (id) => `categories/${id}`,
        }),
        getSubcategories: builder.query<any, string | undefined>({
            query: (categoryId) => `subcategories${categoryId ? `?categoryId=${categoryId}` : ''}`,
        }),
        getSubcategoryById: builder.query<any, string>({
            query: (id) => `subcategories/${id}`,
        }),
        getRelatedProducts: builder.query<any, { productId: string; subcategoryId: string }>({
            query: ({ productId, subcategoryId }) => ({
                url: `products/${productId}/related`,
                params: { subcategoryId },
            }),
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductByIdQuery,
    useSearchProductsQuery,
    useGetCategoriesQuery,
    useGetCategoryByIdQuery,
    useGetSubcategoriesQuery,
    useGetSubcategoryByIdQuery,
    useGetRelatedProductsQuery,
} = api;
