import { NextResponse } from "next/server"
import { getAllProducts } from "@/lib/product-api"

export async function GET() {
  try {
    const products = await getAllProducts()

    return NextResponse.json({
      success: true,
      data: products,
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
