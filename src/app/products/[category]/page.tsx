"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Star,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/contexts/cart-context"
import { SearchBar } from "@/components/search-bar"
import { CategoryNavigation } from "@/components/category-navigation"
import { useGetProductByIdQuery, useGetProductsQuery } from "@/store/api"

export default function ProductDetailPage({ params }: { params: { category: string; id: string } }) {
  const { dispatch } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const { data: product, isLoading, isError } = useGetProductByIdQuery(params.id)
  const { data: relatedProductsData } = useGetProductsQuery(
    {
      filters: { categoryId: params.category },
      pagination: { page: 1, limit: 4, sortBy: "createdAt", sortOrder: "desc" },
    },
    {
      skip: !params.category,
    }
  )
  const relatedProducts = relatedProductsData?.products || []

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError || !product) {
    return <div>Error loading product.</div>
  }

  const categoryName = params.category.charAt(0).toUpperCase() + params.category.slice(1)

  const handleAddToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url,
        category: product.categoryId,
      },
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-900">
            Products
          </Link>
          <span>/</span>
          <Link href={`/products/${params.category}`} className="hover:text-gray-900">
            {categoryName}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl bg-gray-50 relative">
              <Image
                src={product.images?.[selectedImage]?.url || "/placeholder.svg"}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-white/80 hover:bg-white">
                <Heart className="h-5 w-5" />
              </Button>
              {selectedImage > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={() => setSelectedImage(selectedImage - 1)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              {selectedImage < (product.images?.length || 0) - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={() => setSelectedImage(selectedImage + 1)}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${selectedImage === index ? "border-purple-600" : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  {product.rating || 0} ({product.reviews || 0} reviews)
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                )}
                {product.originalPrice && (
                  <Badge className="bg-red-100 text-red-800">Save ${product.originalPrice - product.price}</Badge>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features?.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="h-10 w-10">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-4">
                <Button size="lg" className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleAddToCart}>
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </Button>
                <Button variant="outline" size="lg">
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="space-y-3 pt-6 border-t">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-4 w-4 text-green-600" />
                <span>Free shipping on orders over $100</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>2-year warranty included</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="h-4 w-4 text-purple-600" />
                <span>30-day return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviews || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Technical Specifications</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Driver Size</dt>
                      <dd>40mm</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Frequency Response</dt>
                      <dd>20Hz - 20kHz</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Impedance</dt>
                      <dd>32 Ohm</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Bluetooth Version</dt>
                      <dd>5.0</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Physical Specifications</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Weight</dt>
                      <dd>250g</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Dimensions</dt>
                      <dd>190 x 160 x 80mm</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Battery Life</dt>
                      <dd>30 hours</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Charging Time</dt>
                      <dd>2 hours</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{product.rating || 0}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{product.reviews || 0} reviews</div>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-2 text-sm">
                        <span>{stars}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${Math.random() * 80 + 10}%` }}
                          />
                        </div>
                        <span className="text-gray-600">{Math.floor(Math.random() * 50 + 10)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="font-medium text-sm">John D.</span>
                        <span className="text-xs text-gray-500">2 days ago</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Amazing sound quality and comfort. The noise cancellation works perfectly and the battery life
                        is exactly as advertised. Highly recommended!
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/products/${relatedProduct.categoryId}/${relatedProduct.id}`}>
                <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-50">
                      <Image
                        src={relatedProduct.images?.[0]?.url || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < Math.floor(relatedProduct.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({relatedProduct.reviews || 0})</span>
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">${relatedProduct.price}</span>
                        {relatedProduct.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">${relatedProduct.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
