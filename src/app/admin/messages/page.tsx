"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminMessageCenter } from "@/components/messaging/admin-message-center"
import { useAuth } from "@/contexts/auth-context"

export default function AdminMessagesPage() {
  const { state } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!state.isLoading && !state.user) {
      router.push("/login")
    } else if (state.user && !["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(state.user.role as string)) {
      router.push("/dashboard")
    }
  }, [state.isLoading, state.user, router])

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!state.user || !["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(state.user.role as string)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Customer Support Dashboard</h1>
          <p className="text-gray-600">Manage customer inquiries and support requests from the admin panel</p>
        </div>

        <AdminMessageCenter />
      </div>
    </div>
  )
}
