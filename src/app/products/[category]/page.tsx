import ProductCategoryPage from "./Category"

const page = async ({ params }: { params: Promise<{ category: string }> }) => {
  const { category } = await params;
  return (
    <div className="">
      <ProductCategoryPage categoryName={category} />
    </div>
  )
}
export default page