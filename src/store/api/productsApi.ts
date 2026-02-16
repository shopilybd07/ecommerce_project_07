import { api, ApiResponse } from './baseApi';
import { Product } from '@/types/product';

export const productsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query<any, { categoryId?: string; subcategoryId?: string } | void>({
            providesTags: ['Product'],
            query: (args) => ({
                url: 'products',
                params: args ? { categoryId: args.categoryId, subcategoryId: args.subcategoryId } : undefined,
            }),
        }),
        getProductById: builder.query<Product, string>({
            providesTags: ['Product'],
            query: (id) => `products/${id}`,
            transformResponse: (response: ApiResponse<Product>) => {
                if (response.success) {
                    return response.data; // ✅ only return data if success
                }
                throw new Error(response.message || "Failed to fetch product"); // ❌ throw error if not success
            },
        }),
        getProductBySlug: builder.query<Product, string>({
            providesTags: ['Product'],
            query: (slug) => `products/slug/${slug}`,
            transformResponse: (response: ApiResponse<Product>) => {
                if (response.success) {
                    return response.data;
                }
                throw new Error(response.message || "Failed to fetch product");
            },
        }),
        searchProducts: builder.query<any, { query: string; filters?: any; pagination?: any }>({
            providesTags: ['Product'],
            query: ({ query, filters, pagination }) => ({
                url: 'products/search',
                params: { q: query, ...filters, ...pagination },
            }),
        }),
        getRelatedProducts: builder.query<Product[], { categoryId?: string; subcategoryId?: string; currentProductId: string }>({
            providesTags: ['Product'],
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
    }),
    overrideExisting: false,
});

export const {
    useGetProductsQuery,
    useGetProductByIdQuery,
    useGetProductBySlugQuery,
    useSearchProductsQuery,
    useGetRelatedProductsQuery,
} = productsApi;
