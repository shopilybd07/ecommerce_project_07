"use client"

import Link from "next/link"
import { ShoppingBag, User, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/search-bar"
import { CategoryNavigation } from "@/components/category-navigation"
import { MobileCategoryMenu } from "@/components/mobile-category-menu";
import { useCart } from "@/contexts/cart-context"
import { Suspense } from "react"

export function PageHeader() {
  const { state, dispatch } = useCart()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6" />
            <span className="font-bold text-xl">ShopilyBD</span>
          </Link>
          <div className="hidden lg:block">
            <CategoryNavigation />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Suspense fallback={<div>Loading...</div>}>
            <div className="hidden md:flex items-center space-x-2">
              <SearchBar className="w-[200px] lg:w-[300px]" />
            </div>
          </Suspense>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => dispatch({ type: "TOGGLE_CART" })}
            >
              <ShoppingBag className="h-5 w-5" />
              {state.itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">{state.itemCount}</Badge>
              )}
            </Button>
            {/* <CartSyncIndicator /> */}
          </div>
          <MobileCategoryMenu />
        </div>
      </div>
    </header>
  )
}
