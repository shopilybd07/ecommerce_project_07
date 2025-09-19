import ProductPage from "@/components/products/ProductPage"

const page = async ({ params }: { params: Promise<{ category: string }> }) => {
  const { category } = await params
  return <ProductPage categoryName={category} />
}
export default page