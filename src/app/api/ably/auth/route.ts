import { type NextRequest, NextResponse } from "next/server"
import Ably from "ably"

if (!process.env.ABLY_API_KEY) {
  throw new Error("ABLY_API_KEY environment variable is not set")
}

const ably = new Ably.Rest({
  key: process.env.ABLY_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userRole } = body

    if (!userId || !userRole) {
      return NextResponse.json({ error: "userId and userRole are required" }, { status: 400 })
    }

    // Define capabilities based on user role
    let capabilities: Record<string, string[]> = {}

    if (["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(userRole)) {
      // Admins can subscribe to admin messages and publish to any channel
      capabilities = {
        "admin:messages": ["subscribe", "publish"],
        "user:support": ["subscribe", "publish"],
        "conversation:*": ["subscribe", "publish"],
      }
    } else if (userRole === "CUSTOMER") {
      // Customers can only subscribe to user support and their own conversations
      capabilities = {
        "user:support": ["subscribe"],
        "conversation:*": ["subscribe", "publish"],
      }
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
