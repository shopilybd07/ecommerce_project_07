import ProductDetails from "@/components/products/ProductDetails"

const page = async ({ params }: { params: Promise<{ category: string, subcategory: string, id: string }> }) => {
  const { category, subcategory, id } = await params;

  console.log(category, subcategory, id);

  return (
    <div className="">
      <ProductDetails productId={id} />
    </div>
  )
}
export default page