import { NextResponse } from "next/server"
import { getConversationStats } from "@/lib/messaging-api"

export async function GET() {
  try {
    const stats = await getConversationStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching conversation stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
