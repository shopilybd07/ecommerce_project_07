import ProductPage from "@/components/products/ProductPage"
import { Suspense } from "react"

const page = async ({ params }: { params: Promise<{ category: string }> }) => {
  const { category } = await params
  return <Suspense fallback={<div>Loading...</div>}> <ProductPage categoryName={category} /> </Suspense>
}
export default page