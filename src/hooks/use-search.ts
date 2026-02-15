"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSearchProductsQuery } from "@/store/api"

export function useSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const { data: rawResults, isLoading } = useSearchProductsQuery(
    {
      query: debouncedQuery,
      filters: {},
      pagination: { page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" },
    },
    {
      skip: !debouncedQuery,
    }
  )

  const searchResults =
    rawResults ?? { products: [], suggestions: [], total: 0, totalResults: 0 }

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleSearchSubmit = useCallback(
    (query: string) => {
      if (!query.trim()) return

      const params = new URLSearchParams(searchParams.toString())
      params.set("q", query)
      router.push(`/search?${params.toString()}`)
    },
    [searchParams, router]
  )

  const clearSearch = useCallback(() => {
    setSearchQuery("")
  }, [])

  return {
    searchQuery,
    searchResults,
    handleSearchChange,
    handleSearchSubmit,
    clearSearch,
    isLoading,
  }
}
