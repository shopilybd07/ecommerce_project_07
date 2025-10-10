"use client"

import { useState, useEffect, useRef } from "react"
import { Send, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMessaging } from "@/hooks/use-messaging"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"

export function CustomerMessageCenter() {
  const { state } = useAuth()
  const [messageInput, setMessageInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, conversations, isConnected, isLoading, sendMessage, fetchMessages, selectedConversationId } =
    useMessaging({
      userId: state.user?.id || "",
      userRole: "CUSTOMER",
      isAdmin: false,
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
      // If no conversation selected, create new one
      const conversationId = selectedConversationId || undefined
      await sendMessage(messageInput, conversationId)
      setMessageInput("")

      // If this was the first message, fetch conversations to get the new one
      if (!selectedConversationId) {
        setTimeout(() => {
          // The conversation will be created and we'll get it via real-time updates
        }, 1000)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleConversationSelect = async (conversationId: string) => {
    await fetchMessages(conversationId)
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

  // if (!state.user) {
  //   return (
  //     <Card>
  //       <CardContent className="p-6 text-center">
  //         <p>Please log in to access customer support</p>
  //       </CardContent>
  //     </Card>
  //   )
  // }

  // For customers, we'll show a single conversation interface
  const activeConversation = conversations[0] // Most recent conversation
  const hasConversation = conversations.length > 0

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Single conversation interface for customers */}
      <div className="flex-1 flex flex-col">
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
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="text-sm text-gray-500">{isConnected ? "Online" : "Offline"}</span>
                </div>
              </div>
            </div>
            {hasConversation && <Badge variant="secondary">{activeConversation._count.messages} messages</Badge>}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {!hasConversation && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a conversation</h3>
                <p className="text-gray-500">Send a message to get help from our support team</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === state.user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${message.senderId === state.user?.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">
                        {message.senderId === state.user?.id ? "You" : message.sender.name || "Support Agent"}
                      </span>
                      {message.sender.role !== "CUSTOMER" && (
                        <Badge className={`text-xs ${getRoleColor(message.sender.role)}`}>{message.sender.role}</Badge>
                      )}
                    </div>
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${message.senderId === state.user?.id ? "text-blue-100" : "text-gray-500"
                        }`}
                    >
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
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
            {hasConversation
              ? "Continue your conversation with our support team"
              : "Start a new conversation with our support team"}
          </p>
        </div>
      </div>
    </div>
  )
}
