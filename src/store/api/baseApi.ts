import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Wishlist', 'Product', 'Category', 'Subcategory', 'Order', 'User', 'Cart', 'Asset'],
    endpoints: () => ({}),
});
