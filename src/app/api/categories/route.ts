import { type NextRequest, NextResponse } from "next/server"
import { getCategories } from "@/lib/product-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"

    const categories = await getCategories(includeInactive)

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Error in categories API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
      },
      { status: 500 },
    )
  }
}
