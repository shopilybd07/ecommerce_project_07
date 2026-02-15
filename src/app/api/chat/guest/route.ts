import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getOrCreateChatRoom } from "@/lib/chat-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guestId, name, phone } = body

    if (!guestId) {
      return NextResponse.json({ error: "guestId is required" }, { status: 400 })
    }

    const room = await getOrCreateChatRoom(guestId)

    return NextResponse.json({ success: true, data: { userId: guestId, roomId: room.id } })
  } catch (error) {
    console.error("Error creating guest user/room:", error)
    return NextResponse.json({ error: "Failed to init guest chat" }, { status: 500 })
  }
}
