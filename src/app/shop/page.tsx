"use client"

import Link from "next/link"
import Image from "next/image"
import { useGetProductsQuery } from "@/store/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ShopPage() {
  const { data: productsData, isLoading, isError } = useGetProductsQuery()
  const products = productsData?.data || []

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading products.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop All Products</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <Link key={product.id} href={`/products/${product.category.name.toLowerCase()}/${product.id}`}>
            <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-50">
                  <Image
                    src={product.images?.[0]?.url || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                    )}
                  </div>
                  <Badge variant="outline" className="mt-2">{product.category.name}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
