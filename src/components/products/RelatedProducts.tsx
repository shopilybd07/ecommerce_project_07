"use client"

import { useGetRelatedProductsQuery } from "@/store/api"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { ProductGridCard } from "../shared/ProductGridCard"

interface RelatedProductsProps {
  categoryId: string
  subcategoryId?: string
  currentProductId: string
}

export function RelatedProducts({ categoryId, subcategoryId, currentProductId }: RelatedProductsProps) {
  const { data: relatedProducts, isLoading } = useGetRelatedProductsQuery({
    categoryId,
    subcategoryId,
    currentProductId,
  })

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }
  
  if (!relatedProducts || relatedProducts.length === 0) return null

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {relatedProducts.map((product) => (
          <ProductGridCard
            key={product.id}
            product={{ ...product, slug: product.slug ?? "" }}
          />
        ))}
      </div>
    </div>
  )
}
