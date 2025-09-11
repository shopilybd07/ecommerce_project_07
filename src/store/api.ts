import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ProductFilters, PaginationOptions, ProductsResult } from '../lib/product-api';
import { Product } from '@prisma/client';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResult, { filters: ProductFilters; pagination: PaginationOptions }>({
      query: ({ filters, pagination }) => ({
        url: 'products',
        params: { ...filters, ...pagination },
      }),
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => `products/${id}`,
    }),
    searchProducts: builder.query<ProductsResult, { query: string; filters: ProductFilters; pagination: PaginationOptions }>({
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
} = api;
