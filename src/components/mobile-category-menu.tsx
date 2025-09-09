"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import {
  Menu,
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

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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

export function MobileCategoryMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((name) => name !== categoryName) : [...prev, categoryName],
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Categories</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {categories.map((category) => {
            const IconComponent = category.icon
            const isExpanded = expandedCategories.includes(category.name)

            return (
              <Collapsible key={category.name} open={isExpanded} onOpenChange={() => toggleCategory(category.name)}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={category.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-sm font-medium py-2 flex-1 hover:text-purple-600 transition-colors"
                    >
                      <IconComponent className="h-4 w-4" />
                      {category.name}
                    </Link>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="space-y-1">
                    <div className="ml-7 space-y-1">
                      {category.subcategories.map((subcategory) => {
                        const SubIconComponent = subcategory.icon
                        return (
                          <Link
                            key={subcategory.name}
                            href={subcategory.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 text-sm text-gray-600 py-2 hover:text-purple-600 transition-colors"
                          >
                            {SubIconComponent && <SubIconComponent className="h-3 w-3" />}
                            {subcategory.name}
                          </Link>
                        )
                      })}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
