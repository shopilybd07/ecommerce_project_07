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
    tagTypes: ['Wishlist'],
    endpoints: (builder) => ({
        getProducts: builder.query<any, { categoryId?: string; subcategoryId?: string } | void>({
            query: (args) => ({
                url: 'products',
                params: args ? { categoryId: args.categoryId, subcategoryId: args.subcategoryId } : undefined,
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
        getRelatedProducts: builder.query<Product[], { categoryId?: string; subcategoryId?: string; currentProductId: string }>({
            query: ({ categoryId, subcategoryId, currentProductId }) => ({
                url: `products/${currentProductId}/related`,
                params: { categoryId, subcategoryId },
            }),
            transformResponse: (response: ApiResponse<Product[]>) => {
                if (response.success) {
                    return response.data;
                }
                throw new Error(response.message || "Failed to fetch related products");
            },
        }),
        getAssets: builder.query<any[], void>({
            query: () => 'assets/banners',
            transformResponse: (response: ApiResponse<any[]> | { success: boolean; assets: any[] }) => {
                if ('data' in response) {
                    return response.data;
                }
                return response.assets || [];
            },
        }),
        getWishlist: builder.query<any[], void>({
            query: () => 'wishlist',
            providesTags: ['Wishlist'],
        }),
        addToWishlist: builder.mutation<any, { productId: string }>({
            query: (body) => ({
                url: 'wishlist',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Wishlist'],
        }),
        removeFromWishlist: builder.mutation<any, string>({
            query: (productId) => ({
                url: `wishlist/${productId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Wishlist'],
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
    useGetAssetsQuery,
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
} = api;
