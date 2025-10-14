import ProductPage from "@/components/products/ProductPage"
import { Suspense } from "react";

const page = async ({ params }: { params: Promise<{ category: string; subcategory: string }> }) => {
  const { category, subcategory } = await params
  return <Suspense fallback={<div>Loading...</div>}> <ProductPage categoryName={category} subcategoryName={subcategory} /> </Suspense>
}
export default page
