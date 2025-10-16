import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity, userId } = body

    if (!productId || !quantity || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 },
      )
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours

    const checkoutSession = await prisma.checkoutSession.create({
      data: {
        userId,
        productId,
        quantity,
        price: product.price,
        expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkoutSession.id,
      },
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create checkout session",
      },
      { status: 500 },
    )
  }
}
