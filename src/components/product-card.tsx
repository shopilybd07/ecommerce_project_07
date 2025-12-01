"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { MouseEvent, useState } from "react"

export interface ProductForCard {
  id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
  subcategory: string
}

export function ProductCard({ product }: { product: ProductForCard }) {
  const {
    state: { user },
  } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  console.log(product);


  const handleAddToCart = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/checkout/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1, userId: user?.id }),
      })
      const result = await response.json()
      if (result.success) {
        router.push(`/checkout?sessionId=${result.data.sessionId}`)
      } else {
        console.error("Failed to create checkout session:", result.error)
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 border">
      <Link
        href={`/products/${product.category.toLowerCase()}/${product.subcategory.toLowerCase()}/${product.slug}`}
        passHref
      >
        <CardContent className="p-4 text-center">
          <div className="aspect-square overflow-hidden rounded-md bg-gray-100 mb-4">
            <Image
              src={product.images?.[0]?.url || "/placeholder.svg"}
              alt={product.name}
              width={200}
              height={200}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="font-semibold mb-2 text-lg">{product.name}</h3>
          <p className="font-bold text-xl mb-4">৳{product.price.toFixed(2)}</p>
          <Button onClick={handleAddToCart} className="w-full bg-gray-200 hover:bg-gray-300 text-black" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </span>
            ) : (
              "BUY NOW"
            )}
          </Button>
        </CardContent>
      </Link>
    </Card>
  )
}
