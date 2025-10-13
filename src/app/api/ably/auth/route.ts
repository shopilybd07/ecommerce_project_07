import { type NextRequest, NextResponse } from "next/server"
import Ably from "ably"
import prisma from "@/lib/prisma";
import { ABLY_API_KEY } from "@/constants";

if (ABLY_API_KEY) {
  throw new Error("ABLY_API_KEY environment variable is not set")
}

const ably = new Ably.Rest({
  key: ABLY_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userRole } = body

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Define capabilities based on user role
    let capabilities: Record<string, string[]> = {}

    if (userRole && ["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(userRole)) {
      // Admins can subscribe to admin messages and publish to any channel
      capabilities = {
        "admin:messages": ["subscribe", "publish"],
        "user:support": ["subscribe", "publish"],
        "conversation:*": ["subscribe", "publish"],
        "chat:*": ["subscribe", "publish"],
      }
    } else if (userRole && userRole === "CUSTOMER") {
      // Customers can only subscribe to user support and their own conversations
      capabilities = {
        "user:support": ["subscribe"],
        "conversation:*": ["subscribe", "publish"],
      }
    }

    // For any user, if they have a chat room, give them access.
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { userId: userId },
      select: { id: true },
    })

    if (chatRoom) {
      capabilities[`chat:${chatRoom.id}`] = ["subscribe", "publish"]
    }

    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: userId,
      capability: capabilities,
      ttl: 60 * 60 * 1000, // 1 hour
    })

    return NextResponse.json(tokenRequest)
  } catch (error) {
    console.error("Error creating Ably token:", error)
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 })
  }
}
