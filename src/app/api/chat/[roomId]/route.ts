import { NextRequest, NextResponse } from "next/server";
import { sendMessage, getMessages } from "@/lib/chat-api";

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const body = await request.json();
    const { senderId, message } = body;

    if (!senderId || !message) {
      return NextResponse.json({ error: "senderId and message are required" }, { status: 400 });
    }

    const chatMessage = await sendMessage(senderId, params.roomId, message);
    return NextResponse.json(chatMessage);
  } catch (error) {
    console.error(`Error in POST /api/chat/${params.roomId}:`, error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "50");

    const messages = await getMessages(params.roomId, page, limit);
    return NextResponse.json(messages);
  } catch (error) {
    console.error(`Error in GET /api/chat/${params.roomId}:`, error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}