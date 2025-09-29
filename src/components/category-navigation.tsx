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
  return (
    <nav className={`relative ${className}`}>
      <div className="flex items-center space-x-8">
        <Link
          href="/products"
          className="text-sm font-medium transition-colors hover:text-purple-600"
        >
          Categories
        </Link>
      </div>
    </nav>
  )
}
