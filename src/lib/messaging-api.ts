import { prisma } from "./prisma"
import { ablyRest, CHANNELS } from "./ably"
import type { MessageType, MessageStatus, UserRole } from "@prisma/client"

export interface CreateMessageData {
  content: string
  type?: MessageType
  senderId: string
  conversationId?: string
  metadata?: any
}

export interface MessageWithRelations {
  id: string
  content: string
  type: MessageType
  status: MessageStatus
  conversationId: string
  senderId: string
  metadata: any
  createdAt: Date
  updatedAt: Date
  sender: {
    id: string
    name: string | null
    email: string
    avatar: string | null
    role: UserRole
  }
  conversation: {
    id: string
    title: string | null
    isGroup: boolean
    customerId: string | null
    customer: {
      id: string
      name: string | null
      email: string
      avatar: string | null
      role: UserRole
    } | null
  }
}

export interface ConversationWithDetails {
  id: string
  title: string | null
  isGroup: boolean
  customerId: string | null
  createdAt: Date
  updatedAt: Date
  customer: {
    id: string
    name: string | null
    email: string
    avatar: string | null
    role: UserRole
  } | null
  messages: MessageWithRelations[]
  _count: {
    messages: number
  }
  unreadCount: number
}

export async function createMessage(data: CreateMessageData): Promise<MessageWithRelations> {
  try {
    // If no conversation ID provided, create or find conversation for customer
    let conversationId = data.conversationId

    if (!conversationId) {
      // Only customers can create new conversations
      const sender = await prisma.customer.findUnique({
        where: { id: data.senderId },
      })

      if (!sender) {
        throw new Error("Sender not found")
      }

      if (sender.role === "CUSTOMER") {
        // Create new customer support conversation
        const conversation = await prisma.conversation.create({
          data: {
            title: `Support - ${sender.name || sender.email}`,
            isGroup: false,
            customerId: data.senderId,
          },
        })
        conversationId = conversation.id
      } else {
        throw new Error("Only customers can create new conversations")
      }
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content: data.content,
        type: data.type || "TEXT",
        conversationId,
        senderId: data.senderId,
        metadata: data.metadata,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        conversation: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
    })

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    // Publish to appropriate Ably channels
    await publishMessageToChannels(message)

    return message
  } catch (error) {
    console.error("Error creating message:", error)
    throw error
  }
}

// Get all customer conversations for admin panel
export async function getAllCustomerConversations(): Promise<ConversationWithDetails[]> {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        // Only show conversations started by customers
        customerId: {
          not: null,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
            conversation: {
              include: {
                customer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    // Calculate unread messages for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        // Count messages from customer that haven't been read by any admin
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            sender: {
              role: "CUSTOMER",
            },
            status: {
              not: "READ",
            },
          },
        })

        return {
          ...conversation,
          unreadCount,
        }
      }),
    )

    return conversationsWithUnread
  } catch (error) {
    console.error("Error fetching customer conversations:", error)
    throw error
  }
}

// Get customer's own conversations
export async function getCustomerConversations(customerId: string): Promise<ConversationWithDetails[]> {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        customerId: customerId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
            conversation: {
              include: {
                customer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return conversations.map((conv) => ({ ...conv, unreadCount: 0 }))
  } catch (error) {
    console.error("Error fetching customer conversations:", error)
    throw error
  }
}

export async function getMessages(conversationId: string, page = 1, limit = 50) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        conversation: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await prisma.message.count({
      where: {
        conversationId,
      },
    })

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error("Error fetching messages:", error)
    throw error
  }
}

export async function markConversationAsRead(conversationId: string, adminId: string) {
  try {
    // Mark all customer messages in this conversation as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        sender: {
          role: "CUSTOMER",
        },
        status: {
          not: "READ",
        },
      },
      data: {
        status: "READ",
      },
    })

    return true
  } catch (error) {
    console.error("Error marking conversation as read:", error)
    throw error
  }
}

async function publishMessageToChannels(message: MessageWithRelations) {
  try {
    const messageData = {
      id: message.id,
      content: message.content,
      type: message.type,
      conversationId: message.conversationId,
      sender: message.sender,
      conversation: message.conversation,
      createdAt: message.createdAt,
      metadata: message.metadata,
    }

    // Always publish to admin channel for admin panel
    await ablyRest.channels.get(CHANNELS.ADMIN_MESSAGES).publish("new-message", messageData)

    // If message is from customer, also publish to customer support channel
    if (message.sender.role === "CUSTOMER") {
      await ablyRest.channels.get(CHANNELS.USER_SUPPORT).publish("new-message", messageData)
    }

    // Publish to conversation-specific channel for real-time updates
    await ablyRest.channels.get(`conversation:${message.conversationId}`).publish("new-message", messageData)

    console.log("Message published to channels")
  } catch (error) {
    console.error("Error publishing message to Ably:", error)
  }
}

export async function getAdminUsers() {
  try {
    return await prisma.customer.findMany({
      where: {
        role: {
          in: ["ADMIN", "MODERATOR", "SUPER_ADMIN"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
    })
  } catch (error) {
    console.error("Error fetching admin users:", error)
    throw error
  }
}

export async function getConversationStats() {
  try {
    const totalConversations = await prisma.conversation.count({
      where: {
        customerId: {
          not: null,
        },
      },
    })

    const unreadConversations = await prisma.conversation.count({
      where: {
        customerId: {
          not: null,
        },
        messages: {
          some: {
            sender: {
              role: "CUSTOMER",
            },
            status: {
              not: "READ",
            },
          },
        },
      },
    })

    const totalMessages = await prisma.message.count()

    const todayMessages = await prisma.message.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    })

    return {
      totalConversations,
      unreadConversations,
      totalMessages,
      todayMessages,
    }
  } catch (error) {
    console.error("Error fetching conversation stats:", error)
    throw error
  }
}
