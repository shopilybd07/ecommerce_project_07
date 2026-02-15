export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server"
import Ably from "ably"
import prisma from "@/lib/prisma";
import { ABLY_API_KEY } from "@/constants";

export async function POST(request: NextRequest) {
  try {
    if (!ABLY_API_KEY) {
      throw new Error("ABLY_API_KEY environment variable is not set")
    }

    const ably = new Ably.Rest({
      key: ABLY_API_KEY,
    })

    const contentType = request.headers.get("content-type") || ""
    let userId: string | undefined
    let userRole: string | undefined
    let guestId: string | undefined

    try {
      if (contentType.includes("application/json")) {
        const body = await request.json()
        userId = body.userId
        userRole = body.userRole
        guestId = body.guestId
      } else {
        const text = await request.text()
        const params = new URLSearchParams(text)
        userId = params.get("userId") || undefined
        userRole = params.get("userRole") || undefined
        guestId = params.get("guestId") || undefined
        // Fallback to query string if body is empty
        const q = request.nextUrl.searchParams
        userId = userId || q.get("userId") || undefined
        userRole = userRole || q.get("userRole") || undefined
        guestId = guestId || q.get("guestId") || undefined
      }
    } catch (parseErr) {
      // Fallback parsing to query params only
      const q = request.nextUrl.searchParams
      userId = q.get("userId") || undefined
      userRole = q.get("userRole") || undefined
      guestId = q.get("guestId") || undefined
    }

    const clientId = userId || guestId

    if (!clientId) {
      // Allow anonymous guest by generating a short-lived ID
      const anonId = `guest_${Math.random().toString(36).slice(2, 10)}`
      const tokenRequest = await ably.auth.createTokenRequest({
        clientId: anonId,
        capability: { "user:support": ["subscribe", "publish"] },
        ttl: 30 * 60 * 1000,
      })
      return NextResponse.json(tokenRequest)
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
    } else {
      // Guest or unknown role: restrict to support channel
      capabilities = { "user:support": ["subscribe", "publish"] }
    }

    // For any user, if they have a chat room, give them access.
    let chatRoom: { id: string } | null = null
    if (userId) {
      chatRoom = await prisma.chatRoom.findUnique({
        where: { userId: userId },
        select: { id: true },
      })
    }

    if (chatRoom) {
      capabilities[`chat:${chatRoom.id}`] = ["subscribe", "publish"]
    }

    const tokenRequest = await ably.auth.createTokenRequest({
      clientId,
      capability: capabilities,
      ttl: 60 * 60 * 1000, // 1 hour
    })

    return NextResponse.json(tokenRequest)
  } catch (error) {
    console.error("Error creating Ably token:", error)
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 })
  }
}
