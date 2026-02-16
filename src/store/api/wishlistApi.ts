import { api } from './baseApi';

export const wishlistApi = api.injectEndpoints({
    endpoints: (builder) => ({
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
    overrideExisting: false,
});

export const { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } = wishlistApi;
