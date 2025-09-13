"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useGetCategoriesQuery, useGetProductsQuery } from "@/store/api"
import { ProductCard } from "@/components/product-card"
import { ShoppingBag } from "lucide-react"
import { CategoryNavigation } from "@/components/category-navigation"
import { SearchBar } from "@/components/search-bar"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductCategoryPage({ categoryName }: { categoryName: string }) {
    const searchParams = useSearchParams()
    const subcategoryName = searchParams.get("subcategory")

    const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery()

    const category = useMemo(() => {
        return categoriesData?.data.find(
            (c: any) => c.name.toLowerCase() === categoryName.toLowerCase()
        )
    }, [categoriesData, categoryName])

    const subcategory = useMemo(() => {
        if (!category || !subcategoryName) return null
        return category.subcategories.find(
            (s: any) => s.name.toLowerCase() === subcategoryName.toLowerCase()
        )
    }, [category, subcategoryName])

    const {
        data: productsData,
        isLoading: isLoadingProducts,
        isError,
    } = useGetProductsQuery(
        {
            filters: {
                categoryId: category?.id,
                subcategoryId: subcategory?.id,
            },
            pagination: { page: 1, limit: 12 },
        },
        {
            skip: !category,
        }
    )

    const products = productsData?.products || []
    const categoryNameToDisplay = category?.name || categoryName.charAt(0).toUpperCase() + categoryName.slice(1)

    const isLoading = isLoadingCategories || isLoadingProducts

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <ShoppingBag className="h-6 w-6" />
                        <span className="font-bold text-xl">ModernStore</span>
                    </Link>
                    <div className="hidden lg:block">
                        <CategoryNavigation />
                    </div>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <SearchBar className="w-[200px] lg:w-[300px] mr-4" />
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
                    <Link href="/" className="hover:text-gray-900">
                        Home
                    </Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-gray-900">
                        Products
                    </Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{categoryNameToDisplay}</span>
                </nav>

                <h1 className="text-4xl font-extrabold tracking-tight mb-8">
                    {categoryNameToDisplay} Products
                </h1>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-16">
                        <p className="text-red-500">Error loading products for this category.</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16">
                        <p>No products found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
