import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createMessage } from "@/lib/messaging-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guestId, content, name, email } = body

    if (!guestId || !content?.trim()) {
      return NextResponse.json({ error: "guestId and content are required" }, { status: 400 })
    }

    const guestEmail = email || `guest-${guestId}@guest.local`
    const guestName = name || "Guest"

    // const customer = await prisma.customer.upsert({
    //   where: { email: guestEmail },
    //   update: {},
    //   create: {
    //     email: guestEmail,
    //     name: guestName,
    //     role: "CUSTOMER",
    //     avatar: null,
    //   },
    //   select: { id: true },
    // })

    // console.log(customer);
    

    const message = await createMessage({
      content: content.trim(),
      senderId: guestId,
    })

    return NextResponse.json({ success: true, data: message })
  } catch (error) {
    console.error("Error creating guest support message:", error)
    return NextResponse.json({ error: "Failed to create guest message" }, { status: 500 })
  }
}
