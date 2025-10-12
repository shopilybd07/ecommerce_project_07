import { Product } from '@/types/product';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: () => ({
                url: 'products',
                // params: { ...filters, ...pagination },
            }),
        }),
        getProductById: builder.query<Product, string>({
            query: (id) => `products/${id}`,
            transformResponse: (response: ApiResponse<Product>) => {
                if (response.success) {
                    return response.data; // ✅ only return data if success
                }
                throw new Error(response.message || "Failed to fetch product"); // ❌ throw error if not success
            },
        }),
        getProductBySlug: builder.query<Product, string>({
            query: (slug) => `products/slug/${slug}`,
            transformResponse: (response: ApiResponse<Product>) => {
                if (response.success) {
                    return response.data;
                }
                throw new Error(response.message || "Failed to fetch product");
            },
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
    useGetProductBySlugQuery,
    useSearchProductsQuery,
    useGetCategoriesQuery,
    useGetCategoryByIdQuery,
    useGetSubcategoriesQuery,
    useGetSubcategoryByIdQuery,
    useGetRelatedProductsQuery,
} = api;
