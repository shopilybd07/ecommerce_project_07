import { type NextRequest, NextResponse } from "next/server"
import { getSubcategoryById } from "@/lib/product-api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const subcategory = await getSubcategoryById(params.id)

    if (!subcategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Subcategory not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: subcategory,
    })
  } catch (error) {
    console.error("Error in subcategory API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch subcategory",
      },
      { status: 500 },
    )
  }
}
