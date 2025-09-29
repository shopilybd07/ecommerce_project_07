import { getProductBySlug } from "@/lib/product-api";
import { type NextRequest, NextResponse } from "next/server";

// GET product by slug
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const product = await getProductBySlug(params.slug);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error in product API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
      },
      { status: 500 },
    );
  }
}