import { NextResponse } from "next/server"
import { getOrderById } from "@/lib/order-api"

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const order = await getOrderById(params.id)
        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, data: order })
    } catch (error) {
        console.error("Error fetching order:", error)
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch order",
            },
            { status: 500 }
        )
    }
}