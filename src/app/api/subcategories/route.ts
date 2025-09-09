import { type NextRequest, NextResponse } from "next/server"
import { getSubcategories } from "@/lib/product-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId") || undefined
    const includeInactive = searchParams.get("includeInactive") === "true"

    const subcategories = await getSubcategories(categoryId, includeInactive)

    return NextResponse.json({
      success: true,
      data: subcategories,
    })
  } catch (error) {
    console.error("Error in subcategories API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch subcategories",
      },
      { status: 500 },
    )
  }
}
