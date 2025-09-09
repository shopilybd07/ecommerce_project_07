import { type NextRequest, NextResponse } from "next/server"
import { createOrder, type CreateOrderData } from "@/lib/order-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.customerId || !body.items || !body.shippingAddress || !body.paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    const orderData: CreateOrderData = {
      customerId: body.customerId,
      items: body.items,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress,
      paymentMethod: body.paymentMethod,
      promotionCode: body.promotionCode,
      notes: body.notes,
    }

    const order = await createOrder(orderData)

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
      },
      { status: 500 },
    )
  }
}
