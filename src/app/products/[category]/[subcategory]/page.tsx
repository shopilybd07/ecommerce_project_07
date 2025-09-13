import ProductCategoryPage from "../Category"

const page = async ({ params }: { params: Promise<{ category: string, subcategory: string }> }) => {
  const { category, subcategory } = await params;
  return (
    <div className="">
      <ProductCategoryPage categoryName={category} subcategoryName={subcategory} />
    </div>
  )
}
export default page
