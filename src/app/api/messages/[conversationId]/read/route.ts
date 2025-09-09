import { type NextRequest, NextResponse } from "next/server"
import { markConversationAsRead } from "@/lib/messaging-api"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Verify user is admin/moderator
    const user = await prisma.customer.findUnique({
      where: { id: userId },
    })

    if (!user || !["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await markConversationAsRead(params.conversationId, userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking conversation as read:", error)
    return NextResponse.json({ error: "Failed to mark conversation as read" }, { status: 500 })
  }
}
