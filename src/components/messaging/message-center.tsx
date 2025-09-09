"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Paperclip, Smile, MoreVertical, Phone, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMessaging } from "@/hooks/use-messaging"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"

interface MessageCenterProps {
  isAdmin?: boolean
}

export function MessageCenter({ isAdmin = false }: MessageCenterProps) {
  const { state } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, conversations, isConnected, isLoading, sendMessage, fetchMessages, markAsRead } = useMessaging({
    userId: state.user?.id || "",
    userRole: (state.user?.role as any) || "CUSTOMER",
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !state.user) return

    try {
      await sendMessage(messageInput, selectedConversation || undefined)
      setMessageInput("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleConversationSelect = async (conversationId: string) => {
    setSelectedConversation(conversationId)
    await fetchMessages(conversationId)
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

  if (!state.user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Please log in to access messaging</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{isAdmin ? "Customer Support" : "Messages"}</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-xs text-gray-500">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>
        </div>

        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === conversation.id ? "bg-blue-100 border-blue-200" : "hover:bg-white"
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
                          {conversation.title || conversation.customer?.name || "Unknown User"}
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
                        {conversation.customer?.role !== "CUSTOMER" && (
                          <Badge className={`text-xs ${getRoleColor(conversation.customer?.role)}`}>
                            {conversation.customer?.role}
                          </Badge>
                        )}
                        {conversation._count.messages > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {conversation._count.messages}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>CS</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">Customer Support</h4>
                    <p className="text-sm text-gray-500">{isConnected ? "Online" : "Offline"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === state.user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === state.user?.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{message.sender.name || "Unknown User"}</span>
                        {message.sender.role !== "CUSTOMER" && (
                          <Badge className={`text-xs ${getRoleColor(message.sender.role)}`}>
                            {message.sender.role}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === state.user?.id ? "text-blue-100" : "text-gray-500"
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
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
