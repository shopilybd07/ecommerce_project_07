import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

const sessionRateLimit = new Map<string, { count: number; ts: number }>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity, userId } = body

    if (!productId || !quantity) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()
    const existing = sessionRateLimit.get(ip)
    if (existing && now - existing.ts < 60 * 60 * 1000 && existing.count >= 5) {
      return NextResponse.json(
        { success: false, error: "Too many checkout sessions created. Please try again later." },
        { status: 429 },
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
        userId: userId || null,
        productId,
        quantity,
        price: product.price,
        expiresAt,
      },
    })

    if (!existing || now - existing.ts >= 60 * 60 * 1000) {
      sessionRateLimit.set(ip, { count: 1, ts: now })
    } else {
      sessionRateLimit.set(ip, { count: existing.count + 1, ts: existing.ts })
    }

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
