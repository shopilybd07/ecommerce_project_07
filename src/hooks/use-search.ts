"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  image: string
  category: string
  description: string
  isNew?: boolean
  isSale?: boolean
}

interface SearchResult {
  products: Product[]
  suggestions: string[]
  totalResults: number
  isLoading: boolean
}

// Mock product database
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 299,
    originalPrice: 399,
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?height=300&width=300&text=Headphones",
    category: "electronics",
    description: "High-quality wireless headphones with noise cancellation",
    isSale: true,
  },
  {
    id: "2",
    name: "Smart Watch Series 5",
    price: 399,
    rating: 4.9,
    reviews: 89,
    image: "/placeholder.svg?height=300&width=300&text=Smart+Watch",
    category: "electronics",
    description: "Advanced smartwatch with health monitoring features",
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
    category: "electronics",
    description: "Portable bluetooth speaker with premium sound quality",
    isSale: true,
  },
  {
    id: "4",
    name: "Wireless Charging Pad",
    price: 79,
    rating: 4.6,
    reviews: 178,
    image: "/placeholder.svg?height=300&width=300&text=Charger",
    category: "electronics",
    description: "Fast wireless charging pad for all compatible devices",
  },
  {
    id: "5",
    name: "USB-C Hub Multi-Port",
    price: 89,
    rating: 4.5,
    reviews: 92,
    image: "/placeholder.svg?height=300&width=300&text=USB+Hub",
    category: "electronics",
    description: "Multi-port USB-C hub with HDMI and ethernet support",
  },
  {
    id: "6",
    name: "Portable Power Bank",
    price: 59,
    originalPrice: 79,
    rating: 4.4,
    reviews: 203,
    image: "/placeholder.svg?height=300&width=300&text=Power+Bank",
    category: "electronics",
    description: "High-capacity portable power bank with fast charging",
    isSale: true,
  },
  {
    id: "7",
    name: "Gaming Mechanical Keyboard",
    price: 159,
    rating: 4.7,
    reviews: 145,
    image: "/placeholder.svg?height=300&width=300&text=Keyboard",
    category: "electronics",
    description: "RGB mechanical gaming keyboard with custom switches",
  },
  {
    id: "8",
    name: "4K Webcam",
    price: 129,
    originalPrice: 179,
    rating: 4.5,
    reviews: 67,
    image: "/placeholder.svg?height=300&width=300&text=Webcam",
    category: "electronics",
    description: "Ultra HD 4K webcam for streaming and video calls",
    isSale: true,
  },
  {
    id: "9",
    name: "Wireless Mouse",
    price: 49,
    rating: 4.3,
    reviews: 234,
    image: "/placeholder.svg?height=300&width=300&text=Mouse",
    category: "electronics",
    description: "Ergonomic wireless mouse with precision tracking",
  },
  {
    id: "10",
    name: "Laptop Stand Adjustable",
    price: 39,
    rating: 4.6,
    reviews: 156,
    image: "/placeholder.svg?height=300&width=300&text=Laptop+Stand",
    category: "electronics",
    description: "Adjustable aluminum laptop stand for better ergonomics",
  },
]

export function useSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [searchResults, setSearchResults] = useState<SearchResult>({
    products: [],
    suggestions: [],
    totalResults: 0,
    isLoading: false,
  })
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("searchHistory")
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  // Mock search function
  const performSearch = useCallback(async (query: string): Promise<SearchResult> => {
    if (!query.trim()) {
      return {
        products: [],
        suggestions: [],
        totalResults: 0,
        isLoading: false,
      }
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const lowercaseQuery = query.toLowerCase()

    // Filter products based on name, description, or category
    const filteredProducts = mockProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery),
    )

    // Generate suggestions based on product names
    const suggestions = mockProducts
      .filter((product) => product.name.toLowerCase().includes(lowercaseQuery))
      .map((product) => product.name)
      .slice(0, 5)

    return {
      products: filteredProducts,
      suggestions,
      totalResults: filteredProducts.length,
      isLoading: false,
    }
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string) => {
        clearTimeout(timeoutId)
        setSearchResults((prev) => ({ ...prev, isLoading: true }))

        timeoutId = setTimeout(async () => {
          const results = await performSearch(query)
          setSearchResults(results)
        }, 300)
      }
    })(),
    [performSearch],
  )

  // Handle search input change
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query)
      debouncedSearch(query)
    },
    [debouncedSearch],
  )

  // Handle search submit
  const handleSearchSubmit = useCallback(
    (query: string) => {
      if (!query.trim()) return

      // Add to search history
      const newHistory = [query, ...searchHistory.filter((item) => item !== query)].slice(0, 10)
      setSearchHistory(newHistory)
      localStorage.setItem("searchHistory", JSON.stringify(newHistory))

      // Update URL with search query
      const params = new URLSearchParams(searchParams.toString())
      params.set("q", query)
      router.push(`/search?${params.toString()}`)
    },
    [searchHistory, searchParams, router],
  )

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setSearchResults({
      products: [],
      suggestions: [],
      totalResults: 0,
      isLoading: false,
    })
  }, [])

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([])
    localStorage.removeItem("searchHistory")
  }, [])

  return {
    searchQuery,
    searchResults,
    searchHistory,
    handleSearchChange,
    handleSearchSubmit,
    clearSearch,
    clearSearchHistory,
    isLoading: searchResults.isLoading,
  }
}
