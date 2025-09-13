import { type NextRequest, NextResponse } from "next/server"
import { getProducts } from "@/lib/product-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId") || undefined

    const filters = {
      categoryId,
    }

    const products = await getProducts(filters)

    return NextResponse.json({
      success: true,
      products: products,
    })
  } catch (error) {
    console.error("Error in products API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
      },
      { status: 500 },
    )
  }
}
