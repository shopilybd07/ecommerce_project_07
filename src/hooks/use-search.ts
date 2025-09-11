"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSearchProductsQuery } from "@/store/api"

export function useSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const { data: searchResults, isLoading } = useSearchProductsQuery(
    {
      query: searchQuery,
      filters: {},
      pagination: { page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" },
    },
    {
      skip: !searchQuery,
    }
  )

  useEffect(() => {
    const history = localStorage.getItem("searchHistory")
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleSearchSubmit = useCallback(
    (query: string) => {
      if (!query.trim()) return

      const newHistory = [query, ...searchHistory.filter((item) => item !== query)].slice(0, 10)
      setSearchHistory(newHistory)
      localStorage.setItem("searchHistory", JSON.stringify(newHistory))

      const params = new URLSearchParams(searchParams.toString())
      params.set("q", query)
      router.push(`/search?${params.toString()}`)
    },
    [searchHistory, searchParams, router]
  )

  const clearSearch = useCallback(() => {
    setSearchQuery("")
  }, [])

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
    isLoading,
  }
}
