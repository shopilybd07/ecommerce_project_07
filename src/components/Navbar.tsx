"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, User, Heart, Menu, X, LogOut, Settings, Package } from "lucide-react";
import { Suspense } from "react";
import { SearchBar } from "@/components/search-bar";
import { useCart } from "@/contexts/cart-context";
import { useModal } from "@/contexts/modal-context";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGetCategoriesQuery } from "@/store/api";
import Image from "next/image";

type Subcategory = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
  subcategories: Subcategory[];
};

export function Navbar() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { state: authState, logout } = useAuth();
  const { user } = authState;

  const { data, isLoading } = useGetCategoriesQuery();
  const categories = data?.data || [];

  return (
    <nav className="w-full max-w-[1440px] mx-auto px-4 sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="relative" onMouseLeave={() => setActiveCategory(null)}>
        <div className="flex items-center justify-between px-6 lg:px-0 h-20">
        {/* Mobile menu */}
        <button
          className="lg:hidden cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-semibold tracking-wider uppercase" style={{ fontFamily: "var(--font-display)" }}>
          <Image src="/shopily_logo.png" alt="SHOPILYBD" width={0} height={0} sizes="100vw" className="w-7 h-auto" />
          SHOPILYBD
        </Link>

        {/* Desktop categories */}
        <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {(isLoading ? [] : categories).map((cat: Category) => (
            <div
              key={cat.name}
              className="relative pb-2"
              onMouseEnter={() => setActiveCategory(cat.name)}
            >
              <Link
                href={`/products/${cat.name.toLowerCase()}`}
                className="py-5 text-sm font-medium tracking-wide uppercase text-foreground/80 hover:text-foreground transition-colors"
              >
                {cat.name}
              </Link>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block w-[240px]">
            <Suspense fallback={<div />}>
              <SearchBar />
            </Suspense>
          </div>
          <button aria-label="Search" className="md:hidden text-foreground/70 hover:text-foreground transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <button aria-label="Wishlist" className="hidden sm:block text-foreground/70 hover:text-foreground transition-colors">
            <Heart className="h-5 w-5" />
          </button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.firstName + " " + user.lastName} />
                    <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.firstName + " " + user.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <Package className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard?view=settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link 
              href="/login"
              aria-label="Account" 
              className="hidden sm:block text-foreground/70 hover:text-foreground transition-colors"
            >
              <User className="h-5 w-5" />
            </Link>
          )}

          <button 
            aria-label="Cart" 
            className="relative text-foreground/70 hover:text-foreground transition-colors"
            onClick={() => cartDispatch({ type: "TOGGLE_CART" })}
          >
            <ShoppingBag className="h-5 w-5" />
            {cartState.itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartState.itemCount}
              </span>
            )}
          </button>
        </div>
        </div>

        {activeCategory && (
          <div className="hidden lg:block absolute left-0 right-0 bg-background border-b border-border shadow-lg z-50 pb-12">
            <div className="max-w-5xl mx-auto px-12 py-4">
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-8">
                {categories
                  .find((c: Category) => c.name === activeCategory)
                  ?.subcategories.map((sub: Subcategory) => (
                    <Link
                      key={sub.name}
                      href={`/products/${activeCategory.toLowerCase()}/${sub.name.toLowerCase()}`}
                      className="text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      {sub.name}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background border-b border-border px-6 pb-6">
          {categories.map((cat: Category) => (
            <div key={cat.name} className="border-b border-border last:border-0">
              <button
                className="w-full text-left py-3 text-sm font-medium tracking-wide uppercase"
                onClick={() =>
                  setActiveCategory(activeCategory === cat.name ? null : cat.name)
                }
              >
                {cat.name}
              </button>
              {activeCategory === cat.name && (
                <div className="pl-4 pb-3 space-y-2">
                  {cat.subcategories.map((sub: Subcategory) => (
                    <Link
                      key={sub.name}
                      href={`/products/${cat.name.toLowerCase()}/${sub.name.toLowerCase()}`}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
