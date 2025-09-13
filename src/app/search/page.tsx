"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, Filter, Grid3X3, List, Star, Heart, ShoppingBag, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/search-bar"
import { useSearch } from "@/hooks/use-search"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCart } from "@/contexts/cart-context"
import { CategoryNavigation } from "@/components/category-navigation"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("relevance")

  const { searchResults, isLoading } = useSearch()
  const { dispatch } = useCart()

  const products = searchResults?.products || []

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0 // relevance (keep original order)
    }
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6" />
            <span className="font-bold text-xl">ModernStore</span>
          </Link>
          <div className="flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>
          <div className="hidden lg:block">
            <CategoryNavigation />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Results Header */}
        <div className="mb-8">
          {query ? (
            <div>
              <h1 className="text-2xl font-bold mb-2">Search results for &quot;{query}&quot;</h1>
              <p className="text-gray-600">
                {isLoading ? "Searching..." : `${searchResults?.total || 0} products found`}
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold mb-2">Search Products</h1>
              <p className="text-gray-600">Enter a search term to find products</p>
            </div>
          )}
        </div>

        {/* Search Controls */}
        {products.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    Sort by:{" "}
                    {sortBy === "relevance"
                      ? "Relevance"
                      : sortBy === "price-low"
                        ? "Price: Low to High"
                        : sortBy === "price-high"
                          ? "Price: High to Low"
                          : sortBy === "rating"
                            ? "Rating"
                            : "Name"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy("relevance")}>Relevance</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-low")}>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-high")}>Price: High to Low</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("rating")}>Highest Rated</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name")}>Name A-Z</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Filter Button */}
              <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching products...</p>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && products.length > 0 && (
          <div
            className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}
          >
            {sortedProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.categoryId}/${product.id}`}>
                <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    {viewMode === "grid" ? (
                      <>
                        <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-50 relative">
                          <Image
                            src={product.images?.[0]?.url || "/placeholder.svg"}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-3 right-3 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.preventDefault()
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
                            }}
                            className="absolute bottom-3 left-3 right-3 bg-purple-600 hover:bg-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Add to Cart
                          </Button>
                          {product.isNew && <Badge className="absolute top-3 left-3 bg-green-600">New</Badge>}
                          {product.isSale && <Badge className="absolute top-3 left-3 bg-red-600">Sale</Badge>}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">({product.reviews || 0})</span>
                          </div>
                          <h3 className="font-semibold mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">${product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex gap-4 p-4">
                        <div className="w-24 h-24 overflow-hidden rounded-lg bg-gray-50 relative flex-shrink-0">
                          <Image
                            src={product.images?.[0]?.url || "/placeholder.svg"}
                            alt={product.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                          {product.isNew && <Badge className="absolute top-1 left-1 bg-green-600 text-xs">New</Badge>}
                          {product.isSale && <Badge className="absolute top-1 left-1 bg-red-600 text-xs">Sale</Badge>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">({product.reviews || 0})</span>
                          </div>
                          <h3 className="font-semibold mb-1 group-hover:text-purple-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg">${product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                            )}
                          </div>
                          <Button
                            onClick={(e) => {
                              e.preventDefault()
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
                            }}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Add to Cart
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="self-start">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && query && products.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t find any products matching &quot;{query}&quot;. Try adjusting your search terms.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Search suggestions:</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["headphones", "laptop", "smartphone", "tablet", "speaker"].map((suggestion) => (
                    <Link
                      key={suggestion}
                      href={`/search?q=${suggestion}`}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {suggestion}
                    </Link>
                  ))}
                </div>
              </div>
              <Button asChild>
                <Link href="/">Browse All Products</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !query && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Start your search</h2>
            <p className="text-gray-600 mb-6">
              Enter a product name, category, or description to find what you&apos;re looking for.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Popular searches:</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["headphones", "laptop", "smartphone", "tablet", "speaker"].map((suggestion) => (
                    <Link
                      key={suggestion}
                      href={`/search?q=${suggestion}`}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {suggestion}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
