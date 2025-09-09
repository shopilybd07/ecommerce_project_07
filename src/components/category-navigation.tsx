"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Camera,
  Gamepad2,
  Shirt,
  SaladIcon as Dress,
  FootprintsIcon as Shoe,
  ShoppingBagIcon as Bag,
  Gem,
  Crown,
  Sofa,
  Utensils,
  Flower,
  Wrench,
  Lightbulb,
  Bed,
} from "lucide-react"

interface SubCategory {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface Category {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  subcategories: SubCategory[]
}

const categories: Category[] = [
  {
    name: "Electronics",
    href: "/products/electronics",
    icon: Smartphone,
    subcategories: [
      { name: "Smartphones", href: "/products/electronics/smartphones", icon: Smartphone },
      { name: "Laptops", href: "/products/electronics/laptops", icon: Laptop },
      { name: "Headphones", href: "/products/electronics/headphones", icon: Headphones },
      { name: "Smart Watches", href: "/products/electronics/smartwatches", icon: Watch },
      { name: "Cameras", href: "/products/electronics/cameras", icon: Camera },
      { name: "Gaming", href: "/products/electronics/gaming", icon: Gamepad2 },
    ],
  },
  {
    name: "Fashion",
    href: "/products/fashion",
    icon: Shirt,
    subcategories: [
      { name: "Men's Clothing", href: "/products/fashion/mens", icon: Shirt },
      { name: "Women's Clothing", href: "/products/fashion/womens", icon: Dress },
      { name: "Shoes", href: "/products/fashion/shoes", icon: Shoe },
      { name: "Bags & Accessories", href: "/products/fashion/accessories", icon: Bag },
      { name: "Jewelry", href: "/products/fashion/jewelry", icon: Gem },
      { name: "Watches", href: "/products/fashion/watches", icon: Crown },
    ],
  },
  {
    name: "Home & Garden",
    href: "/products/home",
    icon: Sofa,
    subcategories: [
      { name: "Furniture", href: "/products/home/furniture", icon: Sofa },
      { name: "Kitchen", href: "/products/home/kitchen", icon: Utensils },
      { name: "Garden", href: "/products/home/garden", icon: Flower },
      { name: "Tools", href: "/products/home/tools", icon: Wrench },
      { name: "Lighting", href: "/products/home/lighting", icon: Lightbulb },
      { name: "Bedding", href: "/products/home/bedding", icon: Bed },
    ],
  },
]

interface CategoryNavigationProps {
  className?: string
}

export function CategoryNavigation({ className }: CategoryNavigationProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <nav className={`relative ${className}`}>
      <div className="flex items-center space-x-6">
        {categories.map((category) => {
          const IconComponent = category.icon
          return (
            <div
              key={category.name}
              className="relative"
              onMouseEnter={() => setHoveredCategory(category.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <Link
                href={category.href}
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-purple-600 py-2"
              >
                <IconComponent className="h-4 w-4" />
                {category.name}
                <ChevronRight className="h-3 w-3 opacity-50" />
              </Link>

              {/* Subcategory Dropdown */}
              {hoveredCategory === category.name && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-sm text-gray-900">{category.name}</h3>
                  </div>
                  <div className="py-2">
                    {category.subcategories.map((subcategory) => {
                      const SubIconComponent = subcategory.icon
                      return (
                        <Link
                          key={subcategory.name}
                          href={subcategory.href}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors"
                        >
                          {SubIconComponent && <SubIconComponent className="h-4 w-4" />}
                          {subcategory.name}
                        </Link>
                      )
                    })}
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <Link
                      href={category.href}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      View All {category.name}
                      <ChevronRight className="h-3 w-3" />
                    </Link>
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
