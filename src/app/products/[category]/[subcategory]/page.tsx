import ProductPage from "@/components/products/ProductPage"

const page = async ({ params }: { params: Promise<{ category: string; subcategory: string }> }) => {
  const { category, subcategory } = await params
  return <ProductPage categoryName={category} subcategoryName={subcategory} />
}
export default page
