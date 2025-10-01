"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/contexts/auth-context";
import { formatDistanceToNow } from "date-fns";

export function ChatWindow() {
  const { state } = useAuth();
  const { messages, isConnected, isLoading, sendMessage } = useChat();
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    await sendMessage(messageInput);
    setMessageInput("");
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (!firstName) return "U";
    const firstInitial = firstName[0];
    const lastInitial = lastName ? lastName[0] : "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Loading Chat...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Chat with Admin</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs text-gray-500">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${message.senderId === state.user?.id ? "justify-end" : "justify-start"}`}
                >
                  {message.senderId !== state.user?.id && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{getInitials(message.sender.firstName, message.sender.lastName)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderId === state.user?.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === state.user?.id ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {message.senderId === state.user?.id && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={state.user?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{getInitials(state.user?.firstName || null, state.user?.lastName || null)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}