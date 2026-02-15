"use client"

import { useEffect, useRef, useState } from "react"
import Ably from "ably"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Loader2 } from "lucide-react"

type SupportMessage = {
  id: string
  content: string
  senderId: string
  senderType: "guest" | "admin"
  createdAt: string
}

export function ChatFab() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const ablyRef = useRef<Ably.Realtime | null>(null)
  const channelRef = useRef<Ably.Types.RealtimeChannelPromise | null>(null)
  const [guestId, setGuestId] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [roomId, setRoomId] = useState<string>("")

  useEffect(() => {
    let id = localStorage.getItem("guest-id")
    if (!id) {
      id = `guest_${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem("guest-id", id)
    }
    setGuestId(id)

    const initGuest = async () => {
      const resp = await fetch("/api/chat/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: id }),
      })
      const data = await resp.json()
      if (!resp.ok || !data?.data) throw new Error("Failed to init guest chat")
      setUserId(data.data.userId)
      setRoomId(data.data.roomId)

      const client = new Ably.Realtime({
        authUrl: "/api/ably/auth",
        authMethod: "POST",
        authHeaders: { "Content-Type": "application/json" },
        authParams: { userId: data.data.userId, userRole: "CUSTOMER" },
      })
      ablyRef.current = client

      const channel = client.channels.get(`chat:${data.data.roomId}`)
      channelRef.current = channel

      // Load history
      const histResp = await fetch(`/api/chat/${data.data.roomId}`)
      if (histResp.ok) {
        const hist = await histResp.json()
        const mapped = (hist.messages || []).map((m: any) => ({
          id: m.id,
          content: m.message || m.content,
          senderId: m.senderId || m.sender?.id,
          senderType: m.sender?.role === "ADMIN" ? "admin" : "guest",
          createdAt: m.createdAt,
        }))
        setMessages(mapped)
      }

      const onMessage = (message: Ably.Types.Message) => {
        const data = message.data as any
      const senderRole = data.sender?.role || (data.senderType === "guest" ? "CUSTOMER" : "ADMIN")
        const msg: SupportMessage = {
          id: data.id || Math.random().toString(36).slice(2),
        content: data.message || data.content || "",
        senderId: data.sender?.id || data.senderId || "",
          senderType: senderRole === "CUSTOMER" ? "guest" : "admin",
          createdAt: data.createdAt || new Date().toISOString(),
        }
        setMessages((prev) => [...prev, msg])
      }

      channel.subscribe("new-message", onMessage)

      return () => {
        channel.unsubscribe("new-message", onMessage)
        client.connection.close()
      }
    }

    initGuest()
  }, [])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setSending(true)
    try {
      if (!roomId || !userId) throw new Error("Chat not initialized")
      const response = await fetch(`/api/chat/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: userId, message: text }),
      })
      if (!response.ok) {
        throw new Error("Failed to send message")
      }
      setInput("")
      // Do not push optimistic message; rely on Ably subscription
    } catch (e) {
      console.error("Failed to send support message", e)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full h-12 w-12 p-0 shadow-lg bg-purple-600 hover:bg-purple-700"
        aria-label="Chat with support"
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[60vh] p-0">
          <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b bg-white flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Chat Support</h4>
                <p className="text-xs text-gray-500">You can chat without logging in</p>
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-3">
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderType === "guest" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.senderType === "guest" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                      <p>{m.content}</p>
                      <p className={`text-[10px] mt-1 ${m.senderType === "guest" ? "text-purple-100" : "text-gray-500"}`}>{new Date(m.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                />
                <Button onClick={send} disabled={!input.trim() || sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
