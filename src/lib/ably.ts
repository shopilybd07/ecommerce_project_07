import Ably from "ably"

if (!process.env.ABLY_API_KEY) {
  throw new Error("ABLY_API_KEY environment variable is not set")
}

export const ablyRest = new Ably.Rest({
  key: process.env.ABLY_API_KEY,
})

export const CHANNELS = {
  ADMIN_MESSAGES: "admin:messages", // All messages visible to admins
  USER_SUPPORT: "user:support", // Customer support messages
  CONVERSATION_PREFIX: "conversation:", // Individual conversation channels
} as const

export function getConversationChannel(conversationId: string) {
  return `${CHANNELS.CONVERSATION_PREFIX}${conversationId}`
}
