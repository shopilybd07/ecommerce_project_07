"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchBar } from "@/components/search-bar"
import { useCart } from "@/contexts/cart-context"
import { Badge } from "./ui/badge"
import { Suspense, useEffect, useState } from "react"
import { CategoryNavigation } from "./category-navigation"
import { ChatFab } from "@/components/chat-fab"

export function Header() {
  const {
    state: { user },
    logout,
  } = useAuth();
  const { state, dispatch } = useCart()
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="h-32">
      <header
        className={`sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 ${isSticky ? "shadow-md" : ""}`}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-2xl">SHOPILYBD</span>
            </Link>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <div className="flex-1 flex justify-center px-8">
              {isSticky ? null : <SearchBar className="w-full max-w-lg" />}
            </div>
          </Suspense>

          <div className="flex items-center space-x-6 text-sm font-medium">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.firstName} />
                      <AvatarFallback>{user.firstName?.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{`${user.firstName} ${user.lastName}`}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/login">
                  LOGIN / REGISTER
                </Link>
              </Button>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => dispatch({ type: "TOGGLE_CART" })}
              >
                <ShoppingBag className="h-5 w-5" />
                {state.itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {state.itemCount}
                  </Badge>
                )}
              </Button>
              {/* <CartSyncIndicator /> */}
            </div>
          </div>
        </div>
        {isSticky ? <CategoryNavigation /> : null}
      </header>
      {isSticky ? null : <CategoryNavigation />}
      <ChatFab />
    </div>
  )
}
