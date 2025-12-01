import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { assignOrderToCustomer } from "@/lib/order-api"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { customerId } = body

    if (!customerId) {
      return NextResponse.json({ success: false, error: "customerId is required" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: params.id } })
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({ where: { id: customerId } })
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    if (order.customerId) {
      return NextResponse.json({ success: false, error: "Order already assigned" }, { status: 400 })
    }

    if (order.guestEmail && user.email !== order.guestEmail) {
      return NextResponse.json({ success: false, error: "Email mismatch" }, { status: 403 })
    }

    const ok = await assignOrderToCustomer(params.id, customerId)
    if (!ok) {
      return NextResponse.json({ success: false, error: "Failed to assign order" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error assigning order:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
