import { type NextRequest, NextResponse } from "next/server";
import { getRelatedProducts } from "@/lib/product-api";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const subcategoryId = searchParams.get("subcategoryId");

    if (!subcategoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Subcategory ID is required",
        },
        { status: 400 },
      );
    }

    const relatedProducts = await getRelatedProducts(params.id, subcategoryId);

    return NextResponse.json({
      success: true,
      data: relatedProducts,
    });
  } catch (error) {
    console.error("Error in related products API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch related products",
      },
      { status: 500 },
    );
  }
}
