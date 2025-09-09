"use client"

import { useState, useEffect, useRef } from "react"
import { Send, MessageSquare, Users, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMessaging } from "@/hooks/use-messaging"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"

interface ConversationStats {
  totalConversations: number
  unreadConversations: number
  totalMessages: number
  todayMessages: number
}

export function AdminMessageCenter() {
  const { state } = useAuth()
  const [messageInput, setMessageInput] = useState("")
  const [stats, setStats] = useState<ConversationStats | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    conversations,
    isConnected,
    isLoading,
    sendMessage,
    fetchMessages,
    markConversationAsRead,
    selectedConversationId,
  } = useMessaging({
    userId: state.user?.id || "",
    userRole: (state.user?.role as any) || "CUSTOMER",
    isAdmin: true,
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/conversations/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId || !state.user) return

    try {
      await sendMessage(messageInput, selectedConversationId)
      setMessageInput("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleConversationSelect = async (conversationId: string) => {
    await fetchMessages(conversationId)
    await markConversationAsRead(conversationId)
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-800"
      case "ADMIN":
        return "bg-purple-100 text-purple-800"
      case "MODERATOR":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId)

  if (!state.user || !["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(state.user.role as string)) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.unreadConversations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayMessages}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="flex h-[600px] border rounded-lg overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r bg-gray-50">
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Customer Conversations</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-xs text-gray-500">{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>
          </div>

          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No customer conversations yet</div>
            ) : (
              <div className="space-y-1 p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversationId === conversation.id ? "bg-blue-100 border-blue-200" : "hover:bg-white"
                    }`}
                    onClick={() => handleConversationSelect(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.customer?.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{getInitials(conversation.customer?.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {conversation.customer?.name || conversation.customer?.email || "Unknown Customer"}
                          </p>
                          {conversation.messages[0] && (
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(conversation.messages[0].createdAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        {conversation.messages[0] && (
                          <p className="text-sm text-gray-600 truncate">{conversation.messages[0].content}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {conversation._count.messages} messages
                          </Badge>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount} unread
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.customer?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{getInitials(selectedConversation.customer?.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">
                      {selectedConversation.customer?.name ||
                        selectedConversation.customer?.email ||
                        "Unknown Customer"}
                    </h4>
                    <p className="text-sm text-gray-500">Customer Support Conversation</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender.role === "CUSTOMER" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender.role === "CUSTOMER" ? "bg-gray-100 text-gray-900" : "bg-blue-500 text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {message.sender.role === "CUSTOMER" ? "Customer" : message.sender.name || "Admin"}
                          </span>
                          {message.sender.role !== "CUSTOMER" && (
                            <Badge className={`text-xs ${getRoleColor(message.sender.role)}`}>
                              {message.sender.role}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender.role === "CUSTOMER" ? "text-gray-500" : "text-blue-100"
                          }`}
                        >
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your response..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Responding as {state.user?.name || "Admin"} ({state.user?.role})
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a customer conversation to view and respond to messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
