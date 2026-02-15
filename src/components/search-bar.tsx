"use client"

import type React from "react"

import { useState, useRef, useEffect, Suspense } from "react"
import { Search, X, TrendingUp } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSearch } from "@/hooks/use-search"
import { Product } from "@/types/product"

interface SearchBarProps {
  className?: string
  placeholder?: string
  showSuggestions?: boolean
}

export function SearchBar({ className, placeholder = "Search products...", showSuggestions = true }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    searchQuery,
    searchResults,
    handleSearchChange,
    handleSearchSubmit,
    clearSearch,
    isLoading,
  } = useSearch()

  // Popular searches (mock data)
  const popularSearches = ["headphones", "laptop", "smartphone", "tablet", "speaker"]

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    handleSearchChange(value)
    setIsOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      handleSearchSubmit(inputValue)
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    handleSearchSubmit(suggestion)
    setIsOpen(false)
  }

  const handleClear = () => {
    setInputValue("")
    clearSearch()
    inputRef.current?.focus()
  }

  const showDropdown = isOpen && showSuggestions && inputValue.length > 0

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className={`relative ${className}`}>
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setIsOpen(true)}
              className="pl-10 pr-10"
            />
            {inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </form>

        {/* Search Dropdown */}
        {showDropdown && (
          <Card
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-lg"
          >
            <CardContent className="p-0">
              {/* Loading State */}
              {isLoading && (
                <div className="p-4 text-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  Searching...
                </div>
              )}

              {/* Search Suggestions */}
              {!isLoading && inputValue && (searchResults.suggestions?.length || 0) > 0 && (
                <div className="border-b">
                  <div className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Suggestions</div>
                  {searchResults.suggestions?.map((suggestion: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Search Results Preview */}
              {!isLoading && inputValue && (searchResults.products?.length || 0) > 0 && (
                <div className="border-b">
                  <div className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Products ({searchResults.totalResults})
                  </div>
                  {searchResults.products?.slice(0, 3).map((product: Product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.category?.name?.toLowerCase()}/${product.subcategory?.name?.toLowerCase()}/${product.slug || product.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">৳ {product.price}</p>
                      </div>
                      {/* {product.isSale && <Badge className="bg-red-100 text-red-800 text-xs">Sale</Badge>} */}
                    </Link>
                  ))}
                  {(searchResults.products?.length || 0) > 3 && (
                    <Link
                      href={`/search?q=${encodeURIComponent(inputValue)}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-sm text-purple-600 hover:bg-gray-50 text-center"
                    >
                      View all {searchResults.totalResults} results
                    </Link>
                  )}
                </div>
              )}

              {/* No Results */}
              {!isLoading &&
                inputValue &&
                (searchResults.products?.length || 0) === 0 &&
                (searchResults.suggestions?.length || 0) === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">No results found for "{inputValue}"</div>
                )}

              {/* Popular Searches */}
              {!inputValue && (
                <div>
                  <div className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Popular Searches</div>
                  {popularSearches.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(query)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{query}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Suspense>
  )
}
