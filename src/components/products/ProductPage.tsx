"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import {
  Grid3X3,
  List,
  ChevronDown,
  SlidersHorizontal,
  X,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useGetCategoriesQuery, useGetProductsQuery } from "@/store/api"
import { ProductCard } from "@/components/product-card"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"

export default function ProductPage({
  categoryName: categoryNameProp,
  subcategoryName: subcategoryNameProp,
}: {
  categoryName?: string
  subcategoryName?: string
}) {
  const searchParams = useSearchParams()
  const subcategoryNameFromUrl = searchParams.get("subcategory")

  const categoryName = categoryNameProp
  const subcategoryName = subcategoryNameProp || subcategoryNameFromUrl

  const { data: categoriesData } = useGetCategoriesQuery()
  const categoriesForFilter = categoriesData?.data || []

  const { category, subcategory } = useMemo(() => {
    if (!categoriesData) return { category: null, subcategory: null }
    const cat =
      categoryName &&
      categoriesData.data.find((c: any) => c.name.toLowerCase() === categoryName.toLowerCase())
    if (!cat) return { category: null, subcategory: null }
    const subcat =
      subcategoryName &&
      cat.subcategories.find(
        (s: any) => s.name.toLowerCase() === subcategoryName.toLowerCase()
      )
    return { category: cat, subcategory: subcat }
  }, [categoriesData, categoryName, subcategoryName])

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    brands: [] as string[],
    rating: 0,
    features: [] as string[],
    availability: [] as string[],
    categories: [] as string[],
  })

  // Mock filter data
  const filterOptions = {
    availability: ["In Stock", "On Sale", "New Arrivals", "Free Shipping"],
  }

  const { data: productsData, isLoading: isLoadingProducts } = useGetProductsQuery({})

  const products = productsData?.products || []

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter((product: any) => {
      const hasCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(product.category.name)
      return hasCategory
    })
  }, [products, filters])

  const activeFiltersCount =
    (filters.brands.length > 0 ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    (filters.features.length > 0 ? 1 : 0) +
    (filters.availability.length > 0 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0) +
    (filters.categories.length > 0 ? 1 : 0)

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

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter((c) => c !== category),
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 1000],
      brands: [],
      rating: 0,
      features: [],
      availability: [],
      categories: [],
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
          return { ...prev, availability: prev.availability.filter((a) => a !== availability) }
        case "category":
          return { ...prev, categories: prev.categories.filter((c) => c !== value) }
        default:
          return prev
      }
    })
  }

  const pageTitle = subcategory?.name || category?.name || "Products"

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-white">
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
            {category && (
              <>
                <span>/</span>
                <Link
                  href={`/products/${category.name.toLowerCase()}`}
                  className="hover:text-gray-900"
                >
                  {category.name}
                </Link>
              </>
            )}
            {subcategory && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-medium">{subcategory.name}</span>
              </>
            )}
          </nav>

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
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
                  <DropdownMenuItem onClick={() => setSortBy("price-low")}>
                    Price: Low to High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-high")}>
                    Price: High to Low
                  </DropdownMenuItem>
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
                    {/* Categories */}
                    <div>
                      <h4 className="font-medium mb-3">Categories</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {categoriesForFilter.map((category: any) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={filters.categories.includes(category.name)}
                              onCheckedChange={(checked) =>
                                handleCategoryChange(category.name, checked as boolean)
                              }
                            />
                            <label
                              htmlFor={`category-${category.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h4 className="font-medium mb-3">Price Range</h4>
                      <div className="px-2">
                        <Slider
                          value={filters.priceRange}
                          onValueChange={(value) =>
                            setFilters((prev) => ({ ...prev, priceRange: value }))
                          }
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
                                  className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                />
                              ))}
                              <span className="ml-1">& up</span>
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
                              onCheckedChange={(checked) =>
                                handleAvailabilityChange(availability, checked as boolean)
                              }
                            />
                            <label
                              htmlFor={`availability-${availability}`}
                              className="text-sm cursor-pointer"
                            >
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
                        <button
                          onClick={() => removeFilter("price")}
                          className="hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}

                    {filters.rating > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        {filters.rating}+ stars
                        <button
                          onClick={() => removeFilter("rating")}
                          className="hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}

                    {filters.categories.map((category) => (
                      <Badge key={category} variant="secondary" className="gap-1">
                        {category}
                        <button
                          onClick={() => removeFilter("category", category)}
                          className="hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}

                    {/* {filters.brands.map((brand) => (
                    <Badge key={brand} variant="secondary" className="gap-1">
                      {brand}
                      <button
                        onClick={() => removeFilter("brand", brand)}
                        className="hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))} */}

                    {/* {filters.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="gap-1">
                      {feature}
                      <button
                        onClick={() => removeFilter("feature", feature)}
                        className="hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))} */}

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
                {isLoadingProducts
                  ? Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : filteredProducts.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        ...product,
                        image: product.images?.[0]?.url || "",
                        category: product.category.name,
                        subcategory: product.subcategory.name,
                      }}
                    />
                  ))}
              </div>

              {/* Load More */}
              {products.length > 16 && (
                <div className="text-center mt-12">
                  <Button variant="outline" size="lg">
                    Load More Products
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
