"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/cart-context"

export interface ProductForCard {
  id: string
  name: string
  price: number
  images: { url: string }[]
  category: { name: string }
}

export function ProductCard({ product }: { product: ProductForCard }) {
  const { dispatch } = useCart();

  console.log(product);


  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || "",
        category: product.category.name,
        quantity: 1,
      },
    })
  }

  return (
    <Card className="group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300">
      <Link href={`/products/${product.id}`} passHref>
        <CardContent className="p-0">
          <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100 relative">
            <Image
              src={product.images?.[0]?.url || "/placeholder.svg"}
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleAddToCart}
              className="absolute bottom-3 left-3 right-3 bg-purple-600 hover:bg-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Add to Cart
            </Button>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-xs text-gray-500 ml-1">(124)</span>
            </div>
            <h3 className="font-semibold mb-2 group-hover:text-purple-600 transition-colors">{product.name}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                <span className="text-sm text-gray-500 line-through">${(product.price + 50).toFixed(2)}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Sale
              </Badge>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
