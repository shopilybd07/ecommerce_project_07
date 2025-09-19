import { ShoppingBag, Star, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import { HybridCartDrawer } from "@/components/hybrid-cart-drawer"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { getProducts } from "@/lib/product-api"


export default async function HomePage() {
  const products = await getProducts();
  const heroProduct = products[0]

  return (
    <div className="min-h-screen bg-white">
      <PageHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div className="space-y-4">
                <Badge className="bg-white/10 text-white border-white/20">New Collection</Badge>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Discover Your
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {" "}
                    Style
                  </span>
                </h1>
                <p className="text-xl text-gray-300 max-w-lg">
                  Explore our curated collection of premium products designed for the modern lifestyle.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black bg-transparent"
                >
                  View Collection
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 p-8">
                {/* <Image
                  src={heroProduct.images?.[0]?.url || "/placeholder.svg"}
                  alt={heroProduct.name}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover rounded-xl"
                /> */}
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold">4.9/5</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">2,847 reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium products that combine style, quality, and innovation.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingBag className="h-6 w-6" />
                <span className="font-bold text-xl">ModernStore</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your destination for premium products and exceptional shopping experience.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/shop" className="hover:text-white transition-colors">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-white transition-colors">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/deals" className="hover:text-white transition-colors">
                    Deals
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white transition-colors">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white transition-colors">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Shopilybd. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <HybridCartDrawer />
    </div>
  )
}
