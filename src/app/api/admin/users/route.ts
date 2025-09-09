import { NextResponse } from "next/server"
import { getAdminUsers } from "@/lib/messaging-api"

export async function GET() {
  try {
    const adminUsers = await getAdminUsers()
    return NextResponse.json(adminUsers)
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json({ error: "Failed to fetch admin users" }, { status: 500 })
  }
}
