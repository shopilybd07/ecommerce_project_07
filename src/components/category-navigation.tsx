"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { useGetCategoriesQuery, useGetSubcategoriesQuery } from "@/store/api"

interface CategoryNavigationProps {
  className?: string
}

export function CategoryNavigation({ className }: CategoryNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: categoriesData, isLoading, isError } = useGetCategoriesQuery()
  const categories = categoriesData?.data || []

  const { data: subcategoriesData } = useGetSubcategoriesQuery(undefined)
  const subcategories = subcategoriesData?.data || []

  if (isLoading) {
    return <div>Loading categories...</div>
  }

  if (isError) {
    return <div>Error loading categories.</div>
  }

  return (
    <nav className={`relative ${className}`}>
      <div className="flex items-center space-x-8">
        <div
          className="relative"
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <Link
            href="/categories"
            className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-purple-600"
          >
            Categories <ChevronDown className="h-4 w-4" />
          </Link>

          {isMenuOpen && (
            <div className="absolute top-full -left-20 mt-2 w-screen max-w-7xl">
              <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg z-50 p-8 grid grid-cols-4 gap-8">
                {categories.map((category: any) => (
                  <div key={category.id} className="space-y-4">
                    <Link
                      href={`/products/${category.name.toLowerCase()}`}
                      className="font-bold text-lg text-gray-800 hover:text-purple-700 transition-colors flex items-center gap-2"
                    >
                      {category.name}
                    </Link>
                    <div className="space-y-3">
                      {subcategories
                        .filter((s: any) => s.categoryId === category.id)
                        .map((subcategory: any) => (
                          <Link
                            key={subcategory.id}
                            href={`/products/${category.name.toLowerCase()}/${subcategory.name.toLowerCase()}`}
                            className="block text-gray-600 hover:text-purple-700 transition-colors duration-200 transform hover:translate-x-1"
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}