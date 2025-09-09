"use client"

import { useState, useEffect, useCallback } from "react"
import Ably from "ably"
import { CHANNELS, getConversationChannel } from "@/lib/ably"
import type { MessageWithRelations, ConversationWithDetails } from "@/lib/messaging-api"

interface UseMessagingProps {
  userId: string
  userRole: "CUSTOMER" | "ADMIN" | "MODERATOR" | "SUPER_ADMIN"
  isAdmin?: boolean
}

export function useMessaging({ userId, userRole, isAdmin = false }: UseMessagingProps) {
  const [messages, setMessages] = useState<MessageWithRelations[]>([])
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  // Initialize Ably client
  const [ably] = useState(() => {
    return new Ably.Realtime({
      authUrl: "/api/ably/auth",
      authMethod: "POST",
      authHeaders: {
        "Content-Type": "application/json",
      },
      authParams: {
        userId,
        userRole,
      },
    })
  })

  // Subscribe to channels based on user role
  useEffect(() => {
    const channels: Ably.Types.RealtimeChannelPromise[] = []

    const handleNewMessage = (message: Ably.Types.Message) => {
      const messageData = message.data as MessageWithRelations

      // Update conversations list
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id === messageData.conversationId) {
            return {
              ...conv,
              messages: [messageData],
              updatedAt: new Date(messageData.createdAt),
              unreadCount: messageData.sender.role === "CUSTOMER" ? conv.unreadCount + 1 : conv.unreadCount,
            }
          }
          return conv
        })

        // Sort by updated time
        return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      })

      // Update messages if this conversation is selected
      if (selectedConversationId === messageData.conversationId) {
        setMessages((prev) => [...prev, messageData])
      }
    }

    const handleConnectionStateChange = (stateChange: Ably.Types.ConnectionStateChange) => {
      setIsConnected(stateChange.current === "connected")
    }

    if (isAdmin && ["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(userRole)) {
      // Admin: subscribe to admin messages channel
      const adminChannel = ably.channels.get(CHANNELS.ADMIN_MESSAGES)
      adminChannel.subscribe("new-message", handleNewMessage)
      channels.push(adminChannel)
    } else if (userRole === "CUSTOMER") {
      // Customer: subscribe to user support channel
      const supportChannel = ably.channels.get(CHANNELS.USER_SUPPORT)
      supportChannel.subscribe("new-message", handleNewMessage)
      channels.push(supportChannel)
    }

    // Subscribe to specific conversation channel if selected
    if (selectedConversationId) {
      const conversationChannel = ably.channels.get(getConversationChannel(selectedConversationId))
      conversationChannel.subscribe("new-message", handleNewMessage)
      channels.push(conversationChannel)
    }

    ably.connection.on(handleConnectionStateChange)

    // Cleanup
    return () => {
      channels.forEach((channel) => {
        channel.unsubscribe("new-message", handleNewMessage)
      })
      ably.connection.off(handleConnectionStateChange)
    }
  }, [ably, userId, userRole, isAdmin, selectedConversationId])

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/messages?userId=${userId}&isAdmin=${isAdmin}`)
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, isAdmin])

  // Fetch messages for a conversation
  const fetchMessages = useCallback(
    async (conversationId: string) => {
      try {
        const response = await fetch(`/api/messages/${conversationId}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages)
          setSelectedConversationId(conversationId)

          // Mark conversation as read if admin
          if (isAdmin) {
            await markConversationAsRead(conversationId)
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    },
    [isAdmin],
  )

  // Send message
  const sendMessage = useCallback(
    async (content: string, conversationId?: string, type: "TEXT" | "IMAGE" | "FILE" = "TEXT", metadata?: any) => {
      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            type,
            senderId: userId,
            conversationId,
            metadata,
          }),
        })

        if (response.ok) {
          const message = await response.json()
          return message
        }
      } catch (error) {
        console.error("Error sending message:", error)
        throw error
      }
    },
    [userId],
  )

  // Mark conversation as read (admin only)
  const markConversationAsRead = useCallback(
    async (conversationId: string) => {
      if (!isAdmin) return

      try {
        await fetch(`/api/messages/${conversationId}/read`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        })

        // Update local state
        setConversations((prev) =>
          prev.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv)),
        )
      } catch (error) {
        console.error("Error marking conversation as read:", error)
      }
    },
    [userId, isAdmin],
  )

  // Initialize
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return {
    messages,
    conversations,
    isConnected,
    isLoading,
    sendMessage,
    fetchMessages,
    fetchConversations,
    markConversationAsRead,
    selectedConversationId,
  }
}
