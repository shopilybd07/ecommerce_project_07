"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"

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
  const { addToCart } = useCart();

  console.log(product);


  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "",
      category: product.category,
    })
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
          <Button onClick={handleAddToCart} className="w-full bg-gray-200 hover:bg-gray-300 text-black">
            BUY NOW
          </Button>
        </CardContent>
      </Link>
    </Card>
  )
}
