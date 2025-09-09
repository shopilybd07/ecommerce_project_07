import { type NextRequest, NextResponse } from "next/server"
import { getMessages } from "@/lib/messaging-api"

export async function GET(request: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const result = await getMessages(params.conversationId, page, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
