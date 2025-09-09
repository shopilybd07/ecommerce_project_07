"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Grid3X3, List, Star, Heart, ShoppingBag } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { X, SlidersHorizontal } from "lucide-react"
import { SearchBar } from "@/components/search-bar"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Import useCart at the top
import { useCart } from "@/contexts/cart-context"
// Add this import at the top
import { CategoryNavigation } from "@/components/category-navigation"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  image: string
  category: string
  isNew?: boolean
  isSale?: boolean
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    brands: [] as string[],
    rating: 0,
    features: [] as string[],
    availability: [] as string[],
  })

  // Mock filter data
  const filterOptions = {
    brands: ["Apple", "Samsung", "Sony", "Bose", "JBL", "Anker"],
    features: ["Wireless", "Noise Cancelling", "Water Resistant", "Fast Charging", "Bluetooth 5.0"],
    availability: ["In Stock", "On Sale", "New Arrivals", "Free Shipping"],
  }

  const activeFiltersCount =
    (filters.brands.length > 0 ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    (filters.features.length > 0 ? 1 : 0) +
    (filters.availability.length > 0 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0)

  // Mock products data
  const products: Product[] = [
    {
      id: "1",
      name: "Premium Wireless Headphones",
      price: 299,
      originalPrice: 399,
      rating: 4.8,
      reviews: 124,
      image: "/placeholder.svg?height=300&width=300&text=Headphones",
      category: params.category,
      isSale: true,
    },
    {
      id: "2",
      name: "Smart Watch Series 5",
      price: 399,
      rating: 4.9,
      reviews: 89,
      image: "/placeholder.svg?height=300&width=300&text=Smart+Watch",
      category: params.category,
      isNew: true,
    },
    {
      id: "3",
      name: "Bluetooth Speaker Pro",
      price: 149,
      originalPrice: 199,
      rating: 4.7,
      reviews: 256,
      image: "/placeholder.svg?height=300&width=300&text=Speaker",
      category: params.category,
      isSale: true,
    },
    {
      id: "4",
      name: "Wireless Charging Pad",
      price: 79,
      rating: 4.6,
      reviews: 178,
      image: "/placeholder.svg?height=300&width=300&text=Charger",
      category: params.category,
    },
    {
      id: "5",
      name: "USB-C Hub Multi-Port",
      price: 89,
      rating: 4.5,
      reviews: 92,
      image: "/placeholder.svg?height=300&width=300&text=USB+Hub",
      category: params.category,
    },
    {
      id: "6",
      name: "Portable Power Bank",
      price: 59,
      originalPrice: 79,
      rating: 4.4,
      reviews: 203,
      image: "/placeholder.svg?height=300&width=300&text=Power+Bank",
      category: params.category,
      isSale: true,
    },
  ]

  // Add this inside the component function
  const { dispatch } = useCart()

  const handleBrandChange = (brand: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      brands: checked ? [...prev.brands, brand] : prev.brands.filter((b) => b !== brand),
    }))
  }

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      features: checked ? [...prev.features, feature] : prev.features.filter((f) => f !== feature),
    }))
  }

  const handleAvailabilityChange = (availability: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      availability: checked
        ? [...prev.availability, availability]
        : prev.availability.filter((a) => a !== availability),
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 1000],
      brands: [],
      rating: 0,
      features: [],
      availability: [],
    })
  }

  const removeFilter = (type: string, value?: string) => {
    setFilters((prev) => {
      switch (type) {
        case "price":
          return { ...prev, priceRange: [0, 1000] }
        case "rating":
          return { ...prev, rating: 0 }
        case "brand":
          return { ...prev, brands: prev.brands.filter((b) => b !== value) }
        case "feature":
          return { ...prev, features: prev.features.filter((f) => f !== value) }
        case "availability":
          return { ...prev, availability: prev.availability.filter((a) => a !== value) }
        default:
          return prev
      }
    })
  }

  const categoryName = params.category.charAt(0).toUpperCase() + params.category.slice(1)

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
          <div className="hidden md:flex items-center space-x-2">
            <SearchBar className="w-[200px] lg:w-[300px]" />
          </div>
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
          <span className="text-gray-900 font-medium">{categoryName}</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{categoryName}</h1>
            <p className="text-gray-600">{products.length} products found</p>
          </div>
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
                  {sortBy === "featured"
                    ? "Featured"
                    : sortBy === "price-low"
                      ? "Price: Low to High"
                      : sortBy === "price-high"
                        ? "Price: High to Low"
                        : "Rating"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("featured")}>Featured</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-low")}>Price: Low to High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-high")}>Price: High to Low</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("rating")}>Highest Rated</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Button */}
            <Button
              variant="outline"
              className="gap-2 bg-transparent relative"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-purple-600">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <div className={`${showFilters ? "block" : "hidden"} lg:block w-80 flex-shrink-0`}>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                        Clear All
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden h-8 w-8"
                      onClick={() => setShowFilters(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <h4 className="font-medium mb-3">Price Range</h4>
                    <div className="px-2">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, priceRange: value }))}
                        max={1000}
                        min={0}
                        step={10}
                        className="mb-3"
                      />
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>${filters.priceRange[0]}</span>
                        <span>${filters.priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h4 className="font-medium mb-3">Minimum Rating</h4>
                    <div className="space-y-2">
                      {[4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center space-x-2">
                          <Checkbox
                            id={`rating-${rating}`}
                            checked={filters.rating === rating}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({ ...prev, rating: checked ? rating : 0 }))
                            }
                          />
                          <label
                            htmlFor={`rating-${rating}`}
                            className="flex items-center gap-1 text-sm cursor-pointer"
                          >
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-1">& up</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brands */}
                  <div>
                    <h4 className="font-medium mb-3">Brands</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {filterOptions.brands.map((brand) => (
                        <div key={brand} className="flex items-center space-x-2">
                          <Checkbox
                            id={`brand-${brand}`}
                            checked={filters.brands.includes(brand)}
                            onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                          />
                          <label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-medium mb-3">Features</h4>
                    <div className="space-y-2">
                      {filterOptions.features.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox
                            id={`feature-${feature}`}
                            checked={filters.features.includes(feature)}
                            onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                          />
                          <label htmlFor={`feature-${feature}`} className="text-sm cursor-pointer">
                            {feature}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h4 className="font-medium mb-3">Availability</h4>
                    <div className="space-y-2">
                      {filterOptions.availability.map((availability) => (
                        <div key={availability} className="flex items-center space-x-2">
                          <Checkbox
                            id={`availability-${availability}`}
                            checked={filters.availability.includes(availability)}
                            onCheckedChange={(checked) => handleAvailabilityChange(availability, checked as boolean)}
                          />
                          <label htmlFor={`availability-${availability}`} className="text-sm cursor-pointer">
                            {availability}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Active filters:</span>

                  {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
                    <Badge variant="secondary" className="gap-1">
                      ${filters.priceRange[0]} - ${filters.priceRange[1]}
                      <button onClick={() => removeFilter("price")} className="hover:bg-gray-300 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}

                  {filters.rating > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      {filters.rating}+ stars
                      <button onClick={() => removeFilter("rating")} className="hover:bg-gray-300 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}

                  {filters.brands.map((brand) => (
                    <Badge key={brand} variant="secondary" className="gap-1">
                      {brand}
                      <button
                        onClick={() => removeFilter("brand", brand)}
                        className="hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}

                  {filters.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="gap-1">
                      {feature}
                      <button
                        onClick={() => removeFilter("feature", feature)}
                        className="hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}

                  {filters.availability.map((availability) => (
                    <Badge key={availability} variant="secondary" className="gap-1">
                      {availability}
                      <button
                        onClick={() => removeFilter("availability", availability)}
                        className="hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}

                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                    Clear All
                  </Button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {products.map((product) => (
                <Link key={product.id} href={`/products/${params.category}/${product.id}`}>
                  <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      {viewMode === "grid" ? (
                        <>
                          <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-50 relative">
                            <Image
                              src={product.image || "/placeholder.svg"}
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
                                    image: product.image,
                                    category: product.category,
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
                                  className={`h-3 w-3 ${
                                    i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
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
                              src={product.image || "/placeholder.svg"}
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
                                  className={`h-3 w-3 ${
                                    i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                            </div>
                            <h3 className="font-semibold mb-1 group-hover:text-purple-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">Electronics • Premium Quality</p>
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
                                    image: product.image,
                                    category: product.category,
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

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
