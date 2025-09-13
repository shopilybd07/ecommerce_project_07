"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"

import { SearchBar } from "@/components/search-bar"
import { CategoryNavigation } from "@/components/category-navigation"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6" />
          <span className="font-bold text-xl">ModernStore</span>
        </Link>
        <div className="hidden lg:block">
          <CategoryNavigation />
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <SearchBar className="w-[200px] lg:w-[300px] mr-4" />
        </nav>
      </div>
    </header>
  )
}
