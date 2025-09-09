import { type NextRequest, NextResponse } from "next/server"
import { searchProducts, type ProductFilters, type PaginationOptions } from "@/lib/product-api"
import type { ProductStatus, ProductType } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query = searchParams.get("q") || ""

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: {
          products: [],
          total: 0,
          page: 1,
          totalPages: 0,
        },
      })
    }

    // Parse filters
    const filters: ProductFilters = {
      categoryId: searchParams.get("categoryId") || undefined,
      subcategoryId: searchParams.get("subcategoryId") || undefined,
      status: (searchParams.get("status") as ProductStatus) || "ACTIVE",
      type: (searchParams.get("type") as ProductType) || undefined,
      minPrice: searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice")!) : undefined,
      inStock: searchParams.get("inStock") === "true",
      tags: searchParams.get("tags") ? searchParams.get("tags")!.split(",") : undefined,
    }

    // Parse pagination
    const pagination: PaginationOptions = {
      page: searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 20,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    }

    const result = await searchProducts(query, filters, pagination)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error in product search API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search products",
      },
      { status: 500 },
    )
  }
}
