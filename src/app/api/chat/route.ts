import { NextRequest, NextResponse } from "next/server";
import { getOrCreateChatRoom } from "@/lib/chat-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const chatRoom = await getOrCreateChatRoom(userId);
    return NextResponse.json(chatRoom);
  } catch (error) {
    console.error("Error in POST /api/chat:", error);
    return NextResponse.json({ error: "Failed to get or create chat room" }, { status: 500 });
  }
}