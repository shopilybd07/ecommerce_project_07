import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    if (!q.trim()) {
      return NextResponse.json({
        products: [],
        total: 0,
        totalResults: 0,
        suggestions: [],
      })
    }

    const where = {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
      ],
      status: "ACTIVE" as const,
    }

    const [products, count] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          subcategory: true,
          images: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    const suggestions = Array.from(
      new Set(
        products
          .map((p) => p.name)
          .filter((name) => name.toLowerCase().includes(q.toLowerCase()))
      )
    ).slice(0, 5)

    return NextResponse.json({
      products,
      total: count,
      totalResults: count,
      suggestions,
    })
  } catch (error) {
    return NextResponse.json(
      { products: [], total: 0, totalResults: 0, suggestions: [] },
      { status: 500 }
    )
  }
}
