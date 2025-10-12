import ProductDetails from "@/components/products/ProductDetails"

const page = async ({ params }: { params: Promise<{ category: string, subcategory: string, slug: string }> }) => {
  const { slug } = await params;

  return (
    <div className="">
      <ProductDetails productSlug={slug} />
    </div>
  )
}
export default page