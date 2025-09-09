import { type NextRequest, NextResponse } from "next/server"
import { createMessage, getAllCustomerConversations, getCustomerConversations } from "@/lib/messaging-api"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, type, senderId, conversationId, metadata } = body

    if (!content || !senderId) {
      return NextResponse.json({ error: "Content and senderId are required" }, { status: 400 })
    }

    // Verify sender exists
    const sender = await prisma.customer.findUnique({
      where: { id: senderId },
    })

    if (!sender) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 })
    }

    const message = await createMessage({
      content,
      type,
      senderId,
      conversationId,
      metadata,
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const isAdmin = searchParams.get("isAdmin") === "true"

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Verify user exists and get their role
    const user = await prisma.customer.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let conversations

    if (isAdmin && ["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(user.role)) {
      // Admin panel: show all customer conversations
      conversations = await getAllCustomerConversations()
    } else if (user.role === "CUSTOMER") {
      // Customer: show only their own conversations
      conversations = await getCustomerConversations(userId)
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}
