import { type NextRequest, NextResponse } from "next/server"
import { getProductBySku } from "@/lib/product-api"

export async function GET(request: NextRequest, { params }: { params: { sku: string } }) {
  try {
    const product = await getProductBySku(params.sku)

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Error in product SKU API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
      },
      { status: 500 },
    )
  }
}
