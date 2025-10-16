import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const sessionId = (await params).sessionId

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing sessionId",
        },
        { status: 400 },
      )
    }

    const checkoutSession = await prisma.checkoutSession.findUnique({
      where: { id: sessionId },
      include: {
        product: true,
      },
    })

    if (!checkoutSession) {
      return NextResponse.json(
        {
          success: false,
          error: "Checkout session not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: checkoutSession,
    })
  } catch (error) {
    console.error("Error fetching checkout session:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch checkout session",
      },
      { status: 500 },
    )
  }
}
