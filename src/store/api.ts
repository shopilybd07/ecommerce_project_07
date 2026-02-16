export { api } from './api/baseApi';
export type { ApiResponse } from './api/baseApi';

export {
    useGetProductsQuery,
    useGetProductByIdQuery,
    useGetProductBySlugQuery,
    useSearchProductsQuery,
    useGetRelatedProductsQuery,
} from './api/productsApi';
export { useGetCategoriesQuery, useGetCategoryByIdQuery } from './api/categoriesApi';
export { useGetSubcategoriesQuery, useGetSubcategoryByIdQuery } from './api/subcategoriesApi';
export { useGetAssetsQuery } from './api/assetsApi';
export { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from './api/wishlistApi';
