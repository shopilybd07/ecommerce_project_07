"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import Ably from "ably";

// Define types for chat data
interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface ChatRoom {
  id: string;
  userId: string;
  participants: any[];
}

export function useChat() {
  const { state } = useAuth();
  const [ably, setAbly] = useState<Ably.Realtime | null>(null);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initializeAbly = useCallback(async () => {
    if (state.user?.id) {
      try {
        const response = await fetch("/api/ably/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: state.user.id, userRole: state.user.roles[0]?.role.name }),
        });

        if (!response.ok) {
          throw new Error("Failed to authenticate with Ably");
        }

        const tokenRequest = await response.json();
        const ablyClient = new Ably.Realtime({ authCallback: (params, callback) => callback(null, tokenRequest) });

        ablyClient.connection.on("connected", () => setIsConnected(true));
        ablyClient.connection.on("disconnected", () => setIsConnected(false));

        setAbly(ablyClient);
      } catch (error) {
        console.error("Error initializing Ably:", error);
      }
    }
  }, [state.user]);

  useEffect(() => {
    initializeAbly();
    return () => {
      ably?.connection.close();
    };
  }, [initializeAbly, ably]);

  const getOrCreateRoom = useCallback(async () => {
    if (!state.user?.id) return;
    setIsLoading(true);
    try {
      // MOCK API Call
      const room = {
        id: "mock-room-id",
        userId: state.user.id,
        participants: [],
      };
      setChatRoom(room);
    } catch (error) {
      console.error("Error getting or creating chat room:", error);
    } finally {
      setIsLoading(false);
    }
  }, [state.user?.id]);

  useEffect(() => {
    getOrCreateRoom();
  }, [getOrCreateRoom]);

  const fetchMessages = useCallback(async (roomId: string) => {
    try {
      // MOCK API Call
      const data = {
        messages: [
          {
            id: "msg1",
            message: "Hello from admin!",
            senderId: "admin-id",
            createdAt: new Date().toISOString(),
            sender: { id: "admin-id", firstName: "Admin", lastName: "" },
          },
        ],
      };
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  useEffect(() => {
    if (chatRoom?.id) {
      fetchMessages(chatRoom.id);
    }
  }, [chatRoom, fetchMessages]);

  useEffect(() => {
    if (!ably || !chatRoom?.id) return;

    const channel = ably.channels.get(`chat:${chatRoom.id}`);

    const onMessage = (message: any) => {
      setMessages((prevMessages) => [...prevMessages, message.data]);
    };

    channel.subscribe("new-message", onMessage);

    return () => {
      channel.unsubscribe("new-message", onMessage);
    };
  }, [ably, chatRoom?.id]);

  const sendMessage = async (message: string) => {
    if (!chatRoom || !state.user) return;
    try {
       // MOCK API Call
      console.log("Mock sending message:", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return {
    messages,
    chatRoom,
    isConnected,
    isLoading,
    sendMessage,
  };
}