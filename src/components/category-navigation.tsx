"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useGetCategoriesQuery, useGetSubcategoriesQuery } from "@/store/api"

interface CategoryNavigationProps {
  className?: string
}

export function CategoryNavigation({ className }: CategoryNavigationProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { data: categoriesData, isLoading, isError } = useGetCategoriesQuery();
  const categories = categoriesData?.data || []

  const { data: subcategoriesData } = useGetSubcategoriesQuery(undefined)
  const subcategories = subcategoriesData?.data || []

  if (isLoading) {
    // You can return a skeleton loader here for better UX
    return (
      <nav className={`bg-gray-50 border-y ${className}`}>
        <div className="container mx-auto flex h-12 items-center justify-center space-x-8 px-4">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </nav>
    )
  }

  if (isError) {
    return <div></div> // Don't render anything on error
  }

  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter((s: any) => s.categoryId === categoryId)
  }

  return (
    <nav className={`bg-white border-y ${className}`}>
      <div className="container mx-auto flex h-12 items-center justify-center space-x-8 px-4">
        {categories.map((category: any) => {
          const categorySubcategories = getSubcategoriesForCategory(category.id)
          const hasSubcategories = categorySubcategories.length > 0

          return (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <Link
                href={`/products/${category.name.toLowerCase()}`}
                className="flex items-center gap-1 text-sm font-medium uppercase tracking-wider text-gray-700 transition-colors hover:text-black"
              >
                {category.name}
              </Link>

              {hoveredCategory === category.id && hasSubcategories && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="p-2 space-y-1">
                    {categorySubcategories.map((subcategory: any) => (
                      <Link
                        key={subcategory.id}
                        href={`/products/${category.name.toLowerCase()}/${subcategory.name.toLowerCase()}`}
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}