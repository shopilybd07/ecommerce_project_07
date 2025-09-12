import { ShoppingBag, Star, Truck, Shield, Headphones, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { HybridCartDrawer } from "@/components/hybrid-cart-drawer"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { getAllProducts, getCategories } from "@/lib/product-api"


export default async function HomePage() {
  const products = await getAllProducts()
  const categories = await getCategories()
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
                <Image
                  src={heroProduct.images?.[0]?.url || "/placeholder.svg"}
                  alt={heroProduct.name}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover rounded-xl"
                />
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

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Free Shipping</h3>
                <p className="text-sm text-gray-600">On orders over $100</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Payment</h3>
                <p className="text-sm text-gray-600">100% secure transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Headphones className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">24/7 Support</h3>
                <p className="text-sm text-gray-600">Always here to help</p>
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

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-gray-600">Find exactly what you&apos;re looking for</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {categories.slice(0, 3).map((category, index) => {
              const colors = [
                "from-blue-500 to-purple-600",
                "from-pink-500 to-rose-600",
                "from-green-500 to-teal-600",
              ]
              return (
                <div key={category.id} className="group cursor-pointer">
                  <div
                    className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${colors[index % colors.length]
                      } p-8 relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10 h-full flex flex-col justify-end text-white">
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-white/80 mb-4">Explore collection</p>
                      <Button variant="secondary" size="sm" className="w-fit">
                        Shop Now
                      </Button>
                    </div>
                    <Image
                      src={`/placeholder.svg?height=300&width=400&text=${category.name}`}
                      alt={category.name}
                      width={400}
                      height={300}
                      className="absolute top-4 right-4 w-32 h-32 object-cover rounded-lg opacity-80 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay in the Loop</h2>
            <p className="text-purple-100 mb-8">
              Subscribe to our newsletter and be the first to know about new products, exclusive deals, and special
              offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button className="bg-white text-purple-600 hover:bg-gray-100">Subscribe</Button>
            </div>
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
            <p>&copy; 2024 ModernStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <HybridCartDrawer />
    </div>
  )
}
