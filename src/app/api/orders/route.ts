import { type NextRequest, NextResponse } from "next/server"
import { createOrder, type CreateOrderData } from "@/lib/order-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.items || !body.shippingAddress || !body.paymentMethod) {
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
      transactionId: body.transactionId,
      accountNumber: body.accountNumber,
      promotionCode: body.promotionCode,
      notes: body.notes,
      sessionId: body.sessionId,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone,
      guestName: body.guestName,
    };

    if ((orderData.paymentMethod === "BKASH" || orderData.paymentMethod === "NAGAD") && (!orderData.transactionId || !orderData.accountNumber)) {
      return NextResponse.json(
        { success: false, error: "Transaction details required for mobile payments" },
        { status: 400 },
      )
    }
    const order = await createOrder(orderData)

    try {
      const recipient = order.guestEmail || order.customer?.email
      if (recipient) {
        console.log("Order confirmation notification", {
          to: recipient,
          orderNumber: order.orderNumber,
          total: order.total,
        })
      }
    } catch {}

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
