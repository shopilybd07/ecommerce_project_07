import ProductPage from "@/components/products/ProductPage"
import { Suspense } from "react"

export default function AllProductsPage() {
  return <Suspense fallback={<div>Loading...</div>}> <ProductPage /> </Suspense>
}
